````markdown
# 🎓 Campus Career AI

**Campus Career AI** is an intelligent recruitment platform designed specifically for university students and campus recruiters. Unlike traditional job boards that rely on exact keyword matching, this platform utilizes **Vector Embeddings (AI)** to semantically match student resumes with job descriptions, providing a "Fit Score" to help students find the best opportunities.

---

## Live Demo

**Try the live application here:** [https://campus-career-ai.vercel.app/](https://campus-career-ai.vercel.app/)

---

## Key Features

- **🤖 AI Recommendation Engine:** Automatically matches student resumes against job postings using Semantic Vector Search (Qdrant).
- **🔍 Hybrid Search:** Combines traditional keyword search (SQL) with AI-powered meaning search (Vector) for accurate results.
- **📄 Smart Resume Parsing:** Extracts text from PDF resumes automatically upon upload using `pdfplumber`.
- **📊 Match Score:** Displays a percentage match (e.g., "🔥 95% Match") based on Skills, Location, and Resume content.
- **🏢 Company Dashboard:** Employers can post jobs, manage applications, change candidate status (Shortlist/Hire), and view AI-ranked candidates.
- **👤 Student Dashboard:** Students can manage profiles, upload CVs, track application status, and view personalized job feeds.
- **🔒 Secure & Cloud Native:** Uses JWT Authentication, Role-Based Access Control, and Secure Signed URLs for file storage.

---

## 🛠️ Tech Stack

### **Backend**

- 🐍 **Python & FastAPI** - High-performance API framework.
- 🗄️ **SQLModel (SQLAlchemy)** - ORM for database interactions.
- 🔐 **JWT & Passlib** - Secure authentication and password hashing.
- 🐋 **Docker** - Containerized deployment.

### **Frontend**

- ⚛️ **React.js** - Dynamic user interface.
- 🎨 **Tailwind CSS** - Modern styling.
- ⚡ **Vite** - Fast build tool.

### **Data & AI**

- 🐘 **PostgreSQL (Supabase)** - Primary relational database.
- 🧠 **HuggingFace Transformers** - `all-MiniLM-L6-v2` for generating embeddings.
- 🌲 **Qdrant Cloud** - Vector database for semantic search.
- ☁️ **Supabase Storage** - S3-compatible cloud storage for resumes.

---

## ⚙️ Installation & Setup Guide

Follow these steps to run the project locally.

### 1️⃣ Prerequisites

- Python 3.10+
- Node.js & npm
- Git
- Docker (Optional, for containerized run)

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/campus-career-ai.git
cd campus-career-ai
```
````

### 3️⃣ Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Create a `.env` file in the `backend/` folder and add your credentials:
    ```env
    DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
    SECRET_KEY="your_secret_key"
    QDRANT_URL="https://your-cluster.qdrant.io"
    QDRANT_API_KEY="your_qdrant_key"
    SUPABASE_URL="https://your-project.supabase.co"
    SUPABASE_KEY="your_anon_key"
    ```
5.  Run Database Migrations (to create tables):
    ```bash
    alembic upgrade head
    ```
6.  Start the Backend Server:
    ```bash
    uvicorn app.main:app --reload
    ```
    _API will run at: http://localhost:8000_

### 4️⃣ Frontend Setup

1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install Node dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend/` folder:
    ```env
    VITE_API_URL="http://localhost:8000"
    ```
4.  Start the Frontend:
    ```bash
    npm run dev
    ```
    _UI will run at: http://localhost:5173_

---

## 🐳 Running with Docker (Optional)

If you have Docker installed, you can run the backend instantly without installing Python manually.

```bash
# Build the image
docker build -t campus-backend .

# Run the container (Make sure .env exists in backend folder)
docker run -p 10000:10000 --env-file backend/.env campus-backend
```

---

## 🧪 Testing the AI Features

1.  **Login as a Company:** Post a job description (e.g., "Looking for a Python Backend Developer with FastAPI experience").
2.  **Login as a Student:** Upload a PDF Resume containing Python skills.
3.  **Go to Recommendations:** The AI will analyze the resume text and show the job with a high **Match Score**.
4.  **Try Search:** Type "coding apps" – the AI will find "Software Engineer" jobs even if the word "coding" isn't strictly in the title.

```

```
