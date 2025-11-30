from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.models.job import Job, JobView
from app.schemas import JobCreate, JobPublic, JobUpdate, JobRecommendation
from app.api.deps import get_current_user, get_optional_user
from app.core.ai import ai_model
from app.core.vector_db import vector_db
import logging
from sqlmodel import select, col, or_
from app.core.embedding_utils import build_student_embedding_text, build_job_embedding_text


logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/create", response_model=JobPublic)
def create_new_job(
    job_in: JobCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job posting.
    RESTRICTION: Only users with role 'company' can access this.
    """
    
    # 1. Check Role (Security)
    if current_user.role != UserRole.COMPANY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies can post jobs"
        )

    # 2. Check if Company Profile exists (Safety)
    if not current_user.company_profile:
        raise HTTPException(
            status_code=400, 
            detail="Company profile not found for this user"
        )

    # 3. Create Job Object
    # We automatically link it to the logged-in company's ID
    new_job = Job(
        **job_in.model_dump(),
        company_id=current_user.company_profile.id
    )
    
    # 4. Save to DB
    session.add(new_job)
    session.commit()
    session.refresh(new_job)
    
    try:
        # A. Prepare text for the AI (Combine important fields)
        text_to_embed = build_job_embedding_text(
            title=new_job.title,
            description=new_job.description,
            job_type=new_job.job_type,
            location=new_job.location
        )
        
        # B. Generate Vector (List of 384 floats)
        vector = ai_model.generate_embedding(text_to_embed)
        
        # C. Save to Qdrant
        vector_db.upsert_job(
            job_id=new_job.id,
            vector=vector,
            metadata={
                "company_id": new_job.company_id,
                "job_type": new_job.job_type,
                "location": new_job.location,
                "company_name": current_user.company_profile.company_name
            }
        )
        logger.info(f"Job {new_job.id} embedded and saved to Qdrant.")
        
    except Exception as e:
        logger.error(f"Failed to embed job {new_job.id}: {e}")
        # Note: We don't stop the request. The job is saved in SQL, even if AI fails.
        
    return JobPublic(
        **new_job.model_dump(),
        company_name=current_user.company_profile.company_name,
        company_location=current_user.company_profile.location
    )

@router.get("/search", response_model=list[JobPublic])
def search_jobs_sql(
    q: str,  # The search query (e.g., "Python")
    session: Session = Depends(get_session),
    limit: int = 20
):
    """
    Keyword-based Search (SQL).
    Looks for the query string in Title, Description, or Location.
    Case-insensitive.
    """
    # 1. Build the Query
    # ILIKE is PostgreSQL specific for "Case Insensitive LIKE"
    # We use %query% to find the text anywhere in the string
    query_pattern = f"%{q}%"
    
    statement = select(Job).where(
        or_(
            col(Job.title).ilike(query_pattern),
            col(Job.description).ilike(query_pattern),
            col(Job.location).ilike(query_pattern)
        )
    ).where(Job.is_active == True).limit(limit)

    # 2. Execute
    jobs = session.exec(statement).all()

    # 3. Format Response (Add Company Name)
    public_jobs = []
    for job in jobs:
        job_data = job.model_dump()
        if job.company:
            job_data["company_name"] = job.company.company_name
            job_data["company_location"] = job.company.location
        public_jobs.append(JobPublic(**job_data))
        
    return public_jobs

@router.get("/semantic", response_model=list[JobPublic])
def search_jobs_semantic(
    q: str, 
    session: Session = Depends(get_session),
    limit: int = 10
):
    """
    Semantic Search (AI-Powered).
    1. Converts query -> Vector.
    2. Finds nearest neighbors in Qdrant.
    3. Returns matching jobs from SQL.
    """
    if not q:
        return []

    # 1. Generate Embedding for the query
    # e.g., "I want to build apps" -> [0.1, -0.5, ...]
    query_vector = ai_model.generate_embedding(q)

    # 2. Search in Vector DB
    # Returns a list of ScoredPoint objects (id, score, payload)
    search_results = vector_db.search(vector=query_vector, limit=limit)

    if not search_results:
        return []

    # 3. Extract Job IDs from the results
    # Qdrant returns IDs as integers (because we saved them as ints)
    job_ids = [result.id for result in search_results]

    # 4. Fetch full Job details from SQL
    # We use .in_(job_ids) to get them all in one query
    statement = select(Job).where(Job.id.in_(job_ids))
    jobs = session.exec(statement).all()

    # 5. Preserve the Order! 
    # SQL does not return items in the order of the ID list.
    # Qdrant returned the "best match" first, so we must sort the SQL results to match.
    jobs_dict = {job.id: job for job in jobs}
    ordered_jobs = []
    
    for result in search_results:
        job = jobs_dict.get(result.id)
        if job and job.is_active:
            # Convert to schema
            job_data = job.model_dump()
            if job.company:
                job_data["company_name"] = job.company.company_name
                job_data["company_location"] = job.company.location
            
            # Optional: You could attach the "match_score" here if you added it to the Schema
            # job_data["match_score"] = result.score 
            
            ordered_jobs.append(JobPublic(**job_data))

    return ordered_jobs

@router.get("/hybrid", response_model=list[JobPublic])
def search_jobs_hybrid(
    q: str,
    session: Session = Depends(get_session),
    limit: int = 10
):
    """
    Hybrid Search.
    Combines SQL Keyword Search (Exact matches) + Vector Semantic Search (Meaning matches).
    Deduplicates results to avoid showing the same job twice.
    """
    if not q:
        return []

    # 1. Run Semantic Search
    # Convert query -> vector -> Qdrant search
    query_vector = ai_model.generate_embedding(q)
    # We ask for 'limit' number of semantic results
    semantic_points = vector_db.search(vector=query_vector, limit=limit)
    semantic_job_ids = [point.id for point in semantic_points]

    # 2. Run Keyword Search (The "Exact" Search)
    query_pattern = f"%{q}%"
    statement = select(Job).where(
        or_(
            col(Job.title).ilike(query_pattern),
            col(Job.description).ilike(query_pattern),
            col(Job.location).ilike(query_pattern)
        )
    ).where(Job.is_active == True).limit(limit)
    
    keyword_jobs = session.exec(statement).all()
    keyword_job_ids = [job.id for job in keyword_jobs]

    # 3. Combine & Deduplicate
    # We use a Python Set to ensure unique IDs
    all_ids = set(semantic_job_ids + keyword_job_ids)
    
    if not all_ids:
        return []

    # 4. Fetch Full Details from SQL
    # Fetch all jobs that matched EITHER search
    statement = select(Job).where(Job.id.in_(all_ids))
    final_jobs = session.exec(statement).all()

    # 5. Formatting (Add Company Name)
    public_jobs = []
    for job in final_jobs:
        job_data = job.model_dump()
        if job.company:
            job_data["company_name"] = job.company.company_name
            job_data["company_location"] = job.company.location
        public_jobs.append(JobPublic(**job_data))
        
    return public_jobs


@router.get("/recommendations", response_model=list[JobRecommendation])
def get_job_recommendations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    limit: int = 5
):
    """
    Advanced AI Recommendation Engine.
    Implements Weighted Scoring: Semantic (50%) + Skill Overlap (30%) + Location (20%)
    """
    # 1. Validation
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students get recommendations")
    
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 2. Prepare Skills List (Crucial for the Highlighter)
    student_skills_list = []
    if student.skills:
        student_skills_list = [s.strip().lower() for s in student.skills.split(",") if s.strip()]

    # 3. Build Text for AI Embedding
    text_to_embed = build_student_embedding_text(student.skills, student.resume_text)
    
    if not text_to_embed:
        # Fallback: If no data, return empty list (or latest jobs if you prefer)
        return []

    # 4. Get Candidates from Qdrant
    query_vector = ai_model.generate_embedding(text_to_embed)
    search_results = vector_db.search(vector=query_vector, limit=20)
    
    if not search_results:
        return []

    scores_map = {point.id: point.score for point in search_results}
    job_ids = list(scores_map.keys())

    # 5. Fetch Job Data from SQL
    statement = select(Job).where(Job.id.in_(job_ids))
    jobs = session.exec(statement).all()

    final_recommendations = []

    for job in jobs:
        if not job.is_active:
            continue
        
        # A. Semantic Score (0.0 to 1.0)
        semantic_score = scores_map.get(job.id, 0)

        # B. Skill Overlap Score
        # We check if the student's specific skills appear in the Job text
        job_text = (job.title + " " + job.description).lower()
        matching_skills = []
        missing_skills = []
        
        for skill in student_skills_list:
            if skill in job_text:
                matching_skills.append(skill)
            else:
                missing_skills.append(skill)
        
        skill_score = 0
        if student_skills_list:
            skill_score = len(matching_skills) / len(student_skills_list)

        # C. Location Score
        location_score = 0
        if student.city and job.location:
            if student.city.lower() in job.location.lower():
                location_score = 1.0
            elif "remote" in job.location.lower():
                location_score = 0.8 # Remote is good too
        
        # 50% AI + 30% Skills + 20% Location
        final_score = (semantic_score * 0.5) + (skill_score * 0.3) + (location_score * 0.2)
        final_percent = round(final_score * 100, 1)
        reason = f"High semantic match ({round(semantic_score*100)}%). "
        if matching_skills:
            # Show first 3 matching skills in the reason
            reason += f"Matches skills: {', '.join(matching_skills[:3])}. "
        if location_score >= 0.8:
            reason += "Location/Remote match."

        # Prepare Response Object
        job_data = job.model_dump()
        if job.company:
            job_data["company_name"] = job.company.company_name
            job_data["company_location"] = job.company.location
        
        rec = JobRecommendation(
            **job_data,
            match_score=final_percent,
            matching_skills=matching_skills,
            missing_skills=missing_skills,
            why=reason
        )
        final_recommendations.append(rec)

    # 6. Final Sort by our NEW Weighted Score
    final_recommendations.sort(key=lambda x: x.match_score, reverse=True)

    return final_recommendations[:limit]

@router.get("/my-jobs", response_model=list[JobPublic])
def read_my_jobs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get jobs posted by the CURRENT logged-in company.
    """
    if current_user.role != UserRole.COMPANY or not current_user.company_profile:
        raise HTTPException(status_code=403, detail="Not a company")
        
    # Filter by company_id
    statement = select(Job).where(Job.company_id == current_user.company_profile.id)
    jobs = session.exec(statement).all()
    
    # Format response
    public_jobs = []
    for job in jobs:
        job_data = job.model_dump()
        # We know the company name since it's the current user
        job_data["company_name"] = current_user.company_profile.company_name
        job_data["company_location"] = current_user.company_profile.location 
        public_jobs.append(JobPublic(**job_data))
        
    return public_jobs

@router.get("/", response_model=list[JobPublic])
def read_jobs(
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_optional_user),  # Add optional auth
    offset: int = 0,
    limit: int = 20,
):
    """
    Get all active jobs.
    Public endpoint (no login required to view jobs).
    - For companies: Excludes their own jobs
    - For students/guests: Shows all jobs
    """
    # 1. Base Query: Active jobs only
    statement = select(Job).where(Job.is_active == True)
    
    # 2. Filter out company's own jobs if user is a company
    if current_user and current_user.role == UserRole.COMPANY:
        if current_user.company_profile:
            statement = statement.where(Job.company_id != current_user.company_profile.id)
    
    # 3. Apply pagination
    statement = statement.offset(offset).limit(limit)
    jobs = session.exec(statement).all()

    # 4. Enrich with Company Info
    public_jobs = []
    for job in jobs:
        job_data = job.model_dump()
        
        if job.company:
            job_data["company_name"] = job.company.company_name
            job_data["company_location"] = job.company.location
            
        public_jobs.append(JobPublic(**job_data))

    return public_jobs

@router.put("/{job_id}", response_model=JobPublic)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update a job posting.
    RESTRICTION: Only the Company that posted the job can update it.
    """
    
    # 1. Find the Job
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Security: Check if current user is the owner
    # We check if the current user's company_id matches the job's company_id
    if current_user.role != UserRole.COMPANY or not current_user.company_profile:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if job.company_id != current_user.company_profile.id:
        raise HTTPException(status_code=403, detail="You do not own this job")

    # 3. Update Fields (only if they are provided)
    job_data = job_update.model_dump(exclude_unset=True)
    for key, value in job_data.items():
        setattr(job, key, value)

    # 4. Save
    session.add(job)
    session.commit()
    session.refresh(job)
    
    return job

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a job posting.
    Removes it from both SQL (Postgres) and Vector DB (Qdrant).
    RESTRICTION: Only the Company owner can delete.
    """
    # 1. Find the Job in SQL
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Security Check (Ownership)
    # Ensure user is a company AND owns this specific job
    if current_user.role != UserRole.COMPANY or not current_user.company_profile:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if job.company_id != current_user.company_profile.id:
        raise HTTPException(status_code=403, detail="You do not own this job")

    # 3. Delete from SQL
    session.delete(job)
    session.commit()

    # 4. Delete from Qdrant (AI Memory)
    # We do this AFTER SQL commit to ensure we don't delete vector if SQL fails
    vector_db.delete_job(job_id)

    return {"message": "Job deleted successfully"}

@router.get("/{job_id}", response_model=JobPublic)
def read_job_by_id(
    job_id: int,
    session: Session = Depends(get_session)
):
    """
    Get details of a specific job.
    """
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Prepare response with company info
    job_data = job.model_dump()
    if job.company:
        job_data["company_name"] = job.company.company_name
        job_data["company_location"] = job.company.location
        
    return JobPublic(**job_data)

@router.post("/reindex")
def reindex_all_jobs(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    ADMIN UTILITY: Force re-calculate embeddings for ALL jobs.
    Useful for syncing SQL and Vector DB.
    """
    # Only allow Admin (or Company for now if you haven't made Admin user)
    # Ideally: if current_user.role != UserRole.ADMIN: raise 403
    
    jobs = session.exec(select(Job)).all()
    count = 0
    
    for job in jobs:
        # 1. Generate text
        text_to_embed = build_job_embedding_text(
            title=job.title,
            description=job.description,
            job_type=job.job_type,
            location=job.location,
        )
        
        # 2. Embed
        vector = ai_model.generate_embedding(text_to_embed)
        
        # 3. Upsert
        # We need to fetch company name manually since it might not be loaded
        company_name = job.company.company_name if job.company else "Unknown"
        
        vector_db.upsert_job(
            job_id=job.id,
            vector=vector,
            metadata={
                "company_id": job.company_id,
                "job_type": job.job_type,
                "location": job.location,
                "company_name": company_name
            }
        )
        count += 1
        
    return {"message": f"Successfully re-indexed {count} jobs to Qdrant."}

@router.post("/{job_id}/view")
def increment_job_view(
    job_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Track job views. Prevents duplicates from same IP/User within 24 hours.
    """
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 1. Don't count if Company is viewing their own job
    if current_user and current_user.role == UserRole.COMPANY and current_user.company_profile:
        if job.company_id == current_user.company_profile.id:
            return {"message": "Owner view ignored", "views": job.views_count}
    
    # 2. Check for duplicate view (Last 24 hours)
    ip = request.client.host
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    # Logic: Look for a view on this job, after yesterday, matching EITHER user_id OR ip_address
    query = select(JobView).where(
        JobView.job_id == job_id,
        JobView.viewed_at > yesterday
    )
    
    if current_user:
        query = query.where(or_(JobView.user_id == current_user.id, JobView.ip_address == ip))
    else:
        query = query.where(JobView.ip_address == ip)

    existing_view = session.exec(query).first()
    
    if not existing_view:
        # 3. Create Record
        new_view = JobView(
            job_id=job_id,
            ip_address=ip,
            user_id=current_user.id if current_user else None
        )
        session.add(new_view)
        
        # 4. Increment Counter
        job.views_count += 1
        session.add(job)
        
        session.commit()
        return {"message": "View tracked", "views": job.views_count}
    
    return {"message": "Duplicate view ignored", "views": job.views_count}