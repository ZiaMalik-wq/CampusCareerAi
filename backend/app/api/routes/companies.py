from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.session import get_session
from app.models.auth import User, UserRole
from app.api.deps import get_current_user
from app.schemas import CompanyUpdate, CompanyPublic

router = APIRouter()

@router.get("/profile", response_model=CompanyPublic)
def get_company_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current logged-in company's profile details.
    """
    if current_user.role != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Only companies have company profiles")
    
    company = current_user.company_profile
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    return company

@router.put("/profile", response_model=CompanyPublic)
def update_company_profile(
    company_in: CompanyUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update company details (Name, Location, Website).
    """
    if current_user.role != UserRole.COMPANY:
        raise HTTPException(status_code=403, detail="Only companies can update profiles")
    
    company = current_user.company_profile
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    # Update fields
    update_data = company_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)

    session.add(company)
    session.commit()
    session.refresh(company)

    return company