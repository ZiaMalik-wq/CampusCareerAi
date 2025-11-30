import shutil
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlmodel import Session
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.api.deps import get_current_user
from app.schemas import StudentUpdate, StudentPublic
from app.core.pdf_utils import extract_text_from_pdf

router = APIRouter()

# Setup Upload Directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/profile", response_model=StudentPublic)
def get_student_profile(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students have profiles")
    
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    if student.resume_url:
        # We assume student.resume_url is stored as "uploads/filename.pdf"
        # We strip any leading slash just in case
        clean_path = student.resume_url.lstrip("/")
        
        # Build the full URL using the current request's base URL
        full_url = str(request.base_url) + clean_path
        student.resume_url = full_url

    return student

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
    request: Request,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can upload resumes")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 1. Save file to disk
    filename = f"{current_user.id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Extract Text
    extracted_text = extract_text_from_pdf(file_path)
    
    if not extracted_text:
        # Warning: This happens if the PDF is just an image (scanned)
        print("Warning: No text extracted. PDF might be an image.")

    # 3. Update Database (Url + Text)
    student = current_user.student_profile
    student.resume_url = file_path
    student.resume_text = extracted_text
    session.add(student)
    session.commit()
    session.refresh(student)
    
    full_url = str(request.base_url) + student.resume_url
    return {
        "message": "Resume uploaded and processed successfully", 
        "filename": filename,
        "resume_url": full_url,
        "text_preview": extracted_text[:100] + "..." # Show first 100 chars to prove it worked
    }