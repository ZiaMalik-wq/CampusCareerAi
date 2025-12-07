from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.models.job import Job
from app.models.application import Application, ApplicationStatus
from app.schemas import ApplicationPublic
from app.api.deps import get_current_user
from app.models.auth import Company

router = APIRouter()

@router.post("/{job_id}", response_model=ApplicationPublic)
def apply_to_job(
    job_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Student applies to a Job.
    Uses SQL Transaction with Row Locking to prevent race conditions.
    """
    # 1. Security Check
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply to jobs")
    
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile incomplete")

    # 2. START TRANSACTION
    statement = select(Job).where(Job.id == job_id).with_for_update()
    job = session.exec(statement).one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if not job.is_active:
        raise HTTPException(status_code=400, detail="This job is closed")

    if job.deadline:
        if datetime.utcnow() > job.deadline:
            raise HTTPException(status_code=400, detail="The application deadline has passed")

    # 3. Check for Duplicate Application
    existing_app = session.exec(
        select(Application)
        .where(Application.job_id == job_id)
        .where(Application.student_id == current_user.student_profile.id)
    ).first()

    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # 4. Create Application
    new_application = Application(
        job_id=job.id,
        student_id=current_user.student_profile.id,
        status=ApplicationStatus.APPLIED
    )
    
    session.add(new_application)
    session.commit()
    session.refresh(new_application)

    # 5. Format Response
    return ApplicationPublic(
        id=new_application.id,
        job_id=new_application.job_id,
        student_id=new_application.student_id,
        status=new_application.status,
        applied_at=new_application.applied_at,
        job_title=job.title,
        company_name=job.company.company_name if job.company else "Unknown"
    )


@router.get("/me", response_model=list[ApplicationPublic])
def get_my_applications(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all applications for the logged-in student.
    Includes Job Title and Company Name for display.
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students have applications")
    
    if not current_user.student_profile:
        return []

    # Fetch applications linked to this student
    # We join Job and Company to get the names in one query
    statement = (
        select(Application, Job, Company)
        .join(Job, Application.job_id == Job.id)
        .join(Company, Job.company_id == Company.id)
        .where(Application.student_id == current_user.student_profile.id)
        .order_by(Application.applied_at.desc())
    )
    
    results = session.exec(statement).all()
    
    # Format output
    applications_list = []
    for application, job, company in results:
        app_data = application.model_dump()
        
        # Manually attach details from the joined tables
        app_data["job_title"] = job.title
        app_data["job_location"] = job.location
        app_data["company_name"] = company.company_name
        
        applications_list.append(ApplicationPublic(**app_data))
        
    return applications_list