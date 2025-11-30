from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.auth import UserRole
from typing import Optional
from app.models.job import Job
from typing import List, Optional

# 1. Schema for User Registration (What the Frontend sends)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT  # Default to student
    full_name: str

# 2. Schema for User Response (What we send back - NO PASSWORD!)
class UserPublic(BaseModel):
    id: int
    email: str
    role: UserRole
    full_name: Optional[str] = None

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class JobCreate(BaseModel):
    title: str
    description: str
    location: str
    job_type: str  # Internship, Full-time, etc.
    salary_range: Optional[str] = None
    max_seats: int = 1

class JobPublic(JobCreate):
    id: int
    company_id: int
    company_name: Optional[str] = None
    company_location: Optional[str] = None
    match_score: Optional[float] = None
    created_at: datetime
    is_active: bool

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_range: Optional[str] = None
    max_seats: Optional[int] = None
    is_active: Optional[bool] = None
    
class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    university: Optional[str] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    city: Optional[str] = None 

# Output Schema (Public View)
class StudentPublic(BaseModel):
    full_name: str
    university: Optional[str] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    city: Optional[str] = None
    
class JobRecommendation(JobPublic):
    match_score: float
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    why: Optional[str] = None

class ChatQuery(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    extracted_filters: dict
    results: List[JobPublic]
    
class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    # We can add 'description' later if we update the DB model

# Output Schema
class CompanyPublic(BaseModel):
    company_name: str
    location: Optional[str] = None
    website: Optional[str] = None