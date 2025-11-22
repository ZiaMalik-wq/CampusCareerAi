from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

# 1. Define Roles
class UserRole(str, Enum):
    STUDENT = "student"
    COMPANY = "company"
    ADMIN = "admin"

# 2. USERS Table
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: UserRole = Field(default=UserRole.STUDENT)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships (Backlinks)
    student_profile: Optional["Student"] = Relationship(back_populates="user")
    company_profile: Optional["Company"] = Relationship(back_populates="user")

# 3. STUDENTS Table
class Student(SQLModel, table=True):
    __tablename__ = "students"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Foreign Key linking to User
    user_id: int = Field(foreign_key="users.id")
    
    full_name: str
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    resume_text: Optional[str] = None  # For AI analysis later
    
    # Relationship
    user: Optional[User] = Relationship(back_populates="student_profile")


class Company(SQLModel, table=True):
    __tablename__ = "companies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    company_name: str
    location: Optional[str] = None
    
    # Existing relationship
    user: Optional[User] = Relationship(back_populates="company_profile")

    jobs: List["Job"] = Relationship(back_populates="company")