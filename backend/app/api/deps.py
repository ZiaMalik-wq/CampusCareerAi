from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlmodel import Session, select
from app.db.session import get_session
from app.core.config import settings
from app.models.auth import User

# This tells FastAPI that the token comes from the header: "Authorization: Bearer <token>"
# The "tokenUrl" tells Swagger UI where to get the token (so the 'Authorize' button works)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    session: Session = Depends(get_session)
) -> User:
    """
    Decodes the token, extracts the email, and retrieves the user from DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode the Token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub") # 'sub' holds the email (we defined this yesterday)
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # 2. Get User from DB
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
        
    return user