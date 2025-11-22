from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import check_db_connection
from app.api.routes import auth

# 1. Define the Lifespan (Startup & Shutdown logic)
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    check_db_connection()
    yield
    print("Shutting down...")
# 2. Initialize App with Lifespan
app = FastAPI(
    title=settings.PROJECT_NAME, 
    version="1.0",
    lifespan=lifespan
)

# 3. CORS Config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Register Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "ok"}