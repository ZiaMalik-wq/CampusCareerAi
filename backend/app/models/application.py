from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum

# Define Status Enum
class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    HIRED = "hired"

class Application(SQLModel, table=True):
    __tablename__ = "applications"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationships
    job_id: int = Field(foreign_key="jobs.id")
    student_id: int = Field(foreign_key="students.id")
    
    # Metadata
    status: ApplicationStatus = Field(default=ApplicationStatus.APPLIED)
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Optional: Link to a specific resume snapshot used for this application
    # (For now, we assume we look at the student's current profile)