import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import check_db_connection
from app.core.vector_db import vector_db
from app.api.routes import auth, jobs, students

# 1. Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 2. Define Lifespan (Startup & Shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application is starting up...")
    check_db_connection()
    # Trigger Qdrant Connection
    _ = vector_db
    yield
    logger.info("Application is shutting down...")

# 3. Initialize App
app = FastAPI(
    title=settings.PROJECT_NAME, 
    version="1.0",
    lifespan=lifespan
)

# 4. Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"UNHANDLED ERROR: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please contact support."},
    )

# 5. Middleware (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Register Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(students.router, prefix="/students", tags=["Students"])

# 7. Root Endpoints
@app.get("/", tags=["Status"])
def read_root():
    return {
        "project": settings.PROJECT_NAME, 
        "version": "1.0", 
        "status": "active"
    }

@app.get("/health", tags=["Status"])
def health_check():
    return {"status": "ok"}
