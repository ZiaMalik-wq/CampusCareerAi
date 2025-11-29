import re

def preprocess_resume_text(resume_text: str) -> str:
    """
    Cleans resume text to improve embedding quality.
    """
    if not resume_text:
        return ""
    # Replace multiple spaces/newlines with single space
    text = re.sub(r'\s+', ' ', resume_text).strip()
    return text

def build_student_embedding_text(skills: str, resume_text: str) -> str:
    """
    Combine student's skills and resume text into one string for embedding.
    """
    parts = []

    if skills:
        parts.append(f"My skills are: {skills}.")

    clean_text = preprocess_resume_text(resume_text)
    if clean_text:
        # Limit length to 2000 chars to fit in AI context
        parts.append(f"Experience: {clean_text[:2000]}")  

    return " ".join(parts)

def build_job_embedding_text(title: str, description: str, job_type: str, location: str, skills: str = None) -> str:
    """
    Combine job fields (title, description, type, location) + optional skills into one string for embedding.
    """
    parts = [title, description, job_type, location]

    if skills:
        parts.append(f"Required skills: {skills}")

    # Join all parts and clean whitespace
    text = " ".join([p for p in parts if p])
    text = re.sub(r'\s+', ' ', text).strip()
    return text
