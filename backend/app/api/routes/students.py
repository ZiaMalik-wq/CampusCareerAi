from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.api.deps import get_current_user
from app.schemas import StudentUpdate, StudentPublic
from app.core.pdf_utils import extract_text_from_pdf
from app.core.supabase import supabase

router = APIRouter()

@router.get("/profile", response_model=StudentPublic)
def get_student_profile(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students have profiles")
    
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    if student.resume_url:
        try:
            # We store the path (e.g. "5/cv.pdf") in the DB
            path = student.resume_url
            
            # Request a temporary public link valid for 1 hour (3600 seconds)
            res = supabase.storage.from_("resumes").create_signed_url(path, 3600)
            
            # Handle response structure (it might be a dict or string depending on version)
            if isinstance(res, dict) and "signedURL" in res:
                student.resume_url = res["signedURL"]
            elif isinstance(res, str):
                student.resume_url = res
                
        except Exception as e:
            print(f"Error generating signed URL: {e}")
            # If error, keep the internal path or set to None so UI doesn't break
            pass

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
async def upload_resume(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can upload resumes")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 1. Read file into memory
    file_content = await file.read()
    
    # 2. Create path: "user_id/filename.pdf"
    safe_filename = file.filename.replace(" ", "_")
    file_path = f"{current_user.id}/{safe_filename}"

    try:
        # 3. Upload to Supabase Private Bucket
        supabase.storage.from_("resumes").upload(
            file=file_content, 
            path=file_path, 
            file_options={"content-type": "application/pdf", "upsert": "true"}
        )
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload to cloud storage")

    # 4. Extract text for AI
    extracted_text = extract_text_from_pdf(file_content)

    # 5. Update Database with PATH (not URL)
    student = current_user.student_profile
    student.resume_url = file_path
    student.resume_text = extracted_text
    
    session.add(student)
    session.commit()
    session.refresh(student)

    # 6. Generate Signed URL for immediate response
    signed_url_response = supabase.storage.from_("resumes").create_signed_url(file_path, 600)
    final_url = signed_url_response.get("signedURL") if isinstance(signed_url_response, dict) else signed_url_response

    return {
        "message": "Resume uploaded successfully", 
        "resume_url": final_url,
        "text_preview": extracted_text[:100] + "..."
    }