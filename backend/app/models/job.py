from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from app.models.auth import Company

class Job(SQLModel, table=True):
    __tablename__ = "jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Core Fields
    title: str
    description: str  # This is what the AI will embed later!
    location: str     # e.g., "Lahore", "Remote"
    job_type: str     # e.g., "Internship", "Full-time"
    salary_range: Optional[str] = None
    
    # Logistics
    max_seats: int = 1
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Foreign Key: Link to the Company who posted it
    company_id: int = Field(foreign_key="companies.id")
    
    # Relationship
    company: Optional[Company] = Relationship(back_populates="jobs")