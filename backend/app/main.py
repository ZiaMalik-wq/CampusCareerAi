from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Campus Career AI", version="1.0")

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
    return {"message": "Welcome to Campus Career AI API", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "ok"}