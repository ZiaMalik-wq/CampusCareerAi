from pydantic import BaseModel, EmailStr
from app.models.auth import UserRole

# 1. Schema for User Registration (What the Frontend sends)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT  # Default to student
    full_name: str  # We need this to create the Student/Company profile immediately

# 2. Schema for User Response (What we send back - NO PASSWORD!)
class UserPublic(BaseModel):
    id: int
    email: str
    role: UserRole