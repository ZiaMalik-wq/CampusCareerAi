from pydantic import BaseModel, EmailStr
from app.models.auth import UserRole
from typing import Optional

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

# NEW: Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str