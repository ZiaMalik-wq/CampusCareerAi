# app/db/session.py
from sqlmodel import create_engine, Session
from app.core.config import settings

# Create the database engine
# "echo=True" prints SQL queries to console (great for debugging)
engine = create_engine(settings.DATABASE_URL, echo=True)

def get_session():
    """
    Dependency function to get a database session.
    Use this in your API endpoints.
    """
    with Session(engine) as session:
        yield session