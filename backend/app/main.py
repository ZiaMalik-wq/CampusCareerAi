from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings   # Import settings
from app.db.session import engine      # Import engine
app = FastAPI(title=settings.PROJECT_NAME, version="1.0")


# Enable CORS (Crucial for Member 2 to connect React later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "ok"}