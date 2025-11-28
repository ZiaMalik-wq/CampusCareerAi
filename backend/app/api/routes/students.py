import shutil
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.api.deps import get_current_user
from app.schemas import StudentUpdate, StudentPublic

router = APIRouter()

# Setup Upload Directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.put("/profile", response_model=StudentPublic)
def update_student_profile(
    student_in: StudentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update the logged-in student's profile (University, CGPA, Skills).
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can update profiles")
    
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Update fields
    student_data = student_in.model_dump(exclude_unset=True)
    for key, value in student_data.items():
        setattr(student, key, value)

    session.add(student)
    session.commit()
    session.refresh(student)

    return student

@router.post("/resume")
def upload_resume(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a PDF resume.
    Saves the file locally and updates the database URL.
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can upload resumes")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 1. Create a unique filename (user_id_filename.pdf)
    # This prevents users from overwriting each other's files
    filename = f"{current_user.id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # 2. Save the file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Update DB with the path
    student = current_user.student_profile
    student.resume_url = file_path
    
    session.add(student)
    session.commit()
    session.refresh(student)

    return {"message": "Resume uploaded successfully", "filename": filename}