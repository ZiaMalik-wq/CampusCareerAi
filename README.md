# Campus Career AI

**Campus Career AI** is an intelligent recruitment platform designed specifically for university students and campus recruiters. Unlike traditional job boards that rely on exact keyword matching, this platform utilizes **Vector Embeddings (AI)** to semantically match student resumes with job descriptions, providing a "Fit Score" to help students find the best opportunities.

---

## Live Demo

**Try the live application here:** https://campus-career-ai.vercel.app/

---

## Key Features

- **AI Recommendation Engine:** Automatically matches student resumes against job postings using Semantic Vector Search (Qdrant).
- **Hybrid Search:** Combines traditional keyword search (SQL) with AI-powered meaning search (Vector) for accurate results.
- **Smart Resume Parsing:** Extracts text from PDF resumes automatically upon upload using `pdfplumber`.
- **Match Score:** Displays a percentage match (e.g., "95% Match") based on Skills, Location, and Resume content.
- **Company Dashboard:** Employers can post jobs, manage applications, change candidate status (Shortlist/Hire), and view AI-ranked candidates.
- **Student Dashboard:** Students can manage profiles, upload CVs, track application status, and view personalized job feeds.
- **Secure & Cloud Native:** Uses JWT Authentication, Role-Based Access Control, and Secure Signed URLs for file storage.

---

## Tech Stack

### Backend

- **Python & FastAPI** – High-performance API framework.
- **SQLModel (SQLAlchemy)** – ORM for database interactions.
- **JWT & Passlib** – Secure authentication and password hashing.
- **Docker** – Containerized deployment.

### Frontend

- **React.js** – Dynamic user interface.
- **Tailwind CSS** – Modern styling.
- **Vite** – Fast build tool.

### Data & AI

- **PostgreSQL (Supabase)** – Primary relational database.
- **HuggingFace Transformers** – `all-MiniLM-L6-v2` for generating embeddings.
- **Qdrant Cloud** – Vector database for semantic search.
- **Supabase Storage** – S3-compatible cloud storage for resumes.

---

## Installation & Setup Guide

Follow these steps to run the project locally.

### 1. Prerequisites

- Python 3.10+
- Node.js & npm
- Git
- Docker (Optional, for containerized run)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/campus-career-ai.git
cd campus-career-ai
```

### 3. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` folder and add your credentials:
   ```env
   DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
   SECRET_KEY="your_secret_key"
   QDRANT_URL="https://your-cluster.qdrant.io"
   QDRANT_API_KEY="your_qdrant_key"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_KEY="your_anon_key"
   ```
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   API will run at: http://localhost:8000

### 4. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Go to `api.js` file in the `frontend/src/services` folder:
   ```
   BASE_URL="http://localhost:8000"
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```
   UI will run at: http://localhost:5173

---

## Running with Docker (Optional)

```bash
# Build the image
docker build -t campus-backend .

# Run the container (Make sure .env exists in backend folder)
docker run -p 10000:10000 --env-file backend/.env campus-backend
```

---

## Testing the AI Features

1. Login as a Company and post a job description.
2. Login as a Student and upload a PDF resume.
3. Navigate to Recommendations to view AI-generated Match Scores.
4. Use search queries with related terms to test semantic matching.
