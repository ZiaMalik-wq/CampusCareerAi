from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from app.models.auth import Company, User

class Job(SQLModel, table=True):
    __tablename__ = "jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    location: str
    job_type: str
    salary_range: Optional[str] = None
    max_seats: int = 1
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    views_count: int = Field(default=0)

    company_id: int = Field(foreign_key="companies.id")
    company: Optional[Company] = Relationship(back_populates="jobs")

class JobView(SQLModel, table=True):
    __tablename__ = "job_views"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="jobs.id")
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    ip_address: Optional[str] = None
    viewed_at: datetime = Field(default_factory=datetime.utcnow)