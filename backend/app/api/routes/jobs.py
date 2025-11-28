from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.models.job import Job
from app.schemas import JobCreate, JobPublic, JobUpdate
from app.api.deps import get_current_user
from app.core.ai import ai_model
from app.core.vector_db import vector_db
import logging
from sqlmodel import select, col, or_


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
        text_to_embed = f"{new_job.title}. {new_job.description}. {new_job.job_type}. {new_job.location}"
        
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


@router.get("/", response_model=list[JobPublic])
def read_jobs(
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 20,
):
    """
    Get all active jobs.
    Public endpoint (no login required to view jobs).
    """
    # 1. Query Jobs where is_active is True
    statement = select(Job).where(Job.is_active == True).offset(offset).limit(limit)
    jobs = session.exec(statement).all()

    # 2. Enrich with Company Info
    # We need to manually populate company_name because it's in a different table
    # SQLModel relationships make this easy: job.company.company_name
    public_jobs = []
    for job in jobs:
        # Create a dict from the job model
        job_data = job.model_dump()
        
        # Add company details if available
        if job.company:
            job_data["company_name"] = job.company.company_name
            job_data["company_location"] = job.company.location
            
        public_jobs.append(JobPublic(**job_data))

    return public_jobs

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
        text = f"{job.title}. {job.description}. {job.job_type}. {job.location}"
        
        # 2. Embed
        vector = ai_model.generate_embedding(text)
        
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