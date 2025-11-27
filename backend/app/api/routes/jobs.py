from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.models.job import Job
from app.schemas import JobCreate, JobPublic, JobUpdate
from app.api.deps import get_current_user

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
    
    return new_job

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

