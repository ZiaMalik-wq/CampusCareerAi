import json
import logging
from groq import Groq
from pydantic import ValidationError

from app.core.config import settings
from app.schemas import TechnicalQuestion, BehavioralQuestion, InterviewPrepResponse

logger = logging.getLogger(__name__)

client = Groq(api_key=settings.GROQ_API_KEY)

FREE_GROQ_MODELS = [
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768"
]


SYSTEM_PROMPT = """
You are an expert Senior Technical Recruiter and Interview Coach.

Your task is to analyze:
1. The job title
2. The job description
3. The candidate’s resume

Then generate interview preparation material that focuses on SKILL GAPS
between the job requirements and the candidate’s resume.

STRICT OUTPUT RULES:
- Output ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON
- All fields must be present
- Do NOT add extra keys

JSON SCHEMA (must match exactly):

{
  "technical_questions": [
    {
      "question": "Clear and role-specific technical interview question",
      "expected_answer_key_points": "Bullet-style key points separated by semicolons",
      "difficulty": "Easy | Medium | Hard"
    }
  ],
  "behavioral_questions": [
    {
      "question": "Behavioral interview question",
      "tip": "Short coaching tip on how to answer using STAR method"
    }
  ],
  "resume_feedback": "Exactly 2 concise sentences explaining how to better align the resume with the job."
}

CONTENT REQUIREMENTS:
- Generate EXACTLY 5 technical questions
- Generate EXACTLY 3 behavioral questions
- At least 3 technical questions must address skills or technologies missing or weak in the resume
- Difficulty distribution:
  - 1 Easy
  - 3 Medium
  - 1 Hard
- Questions must be specific to the provided job title and description
- Avoid generic or textbook-style questions
"""

def _build_user_message(job_title: str, job_desc: str, resume: str) -> str:
    return f"""
JOB TITLE:
{job_title}

JOB DESCRIPTION:
{job_desc}

CANDIDATE RESUME:
{resume[:3000]}
"""


def _call_llm(model: str, system_prompt: str, user_message: str) -> dict:
    """
    Calls Groq LLM and returns parsed JSON.
    Raises JSONDecodeError or ValidationError if invalid.
    """
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.5,
        response_format={"type": "json_object"}
    )

    raw_content = completion.choices[0].message.content
    parsed_json = json.loads(raw_content)

    return InterviewPrepResponse.model_validate(parsed_json).model_dump()

def generate_interview_questions(
    job_title: str,
    job_desc: str,
    student_resume: str
) -> InterviewPrepResponse:
    """
    Generates validated interview questions using free Groq models only.
    """

    user_message = _build_user_message(job_title, job_desc, student_resume)

    for model in FREE_GROQ_MODELS:
        try:
            logger.info(f"Generating interview questions using model: {model}")
            return _call_llm(model, SYSTEM_PROMPT, user_message)

        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Invalid AI response from model {model}", exc_info=e)

        except Exception as e:
            logger.error(f"LLM call failed for model {model}", exc_info=e)

    logger.error("All free Groq models failed. Returning fallback response.")

    return InterviewPrepResponse(
        technical_questions=[
            TechnicalQuestion(
                question="Explain a core concept required for this role.",
                expected_answer_key_points="Demonstrates foundational understanding; Explains trade-offs",
                difficulty="Easy"
            )
        ] * 5,
        behavioral_questions=[
            BehavioralQuestion(
                question="Tell me about a challenge you faced during a project.",
                tip="Use the STAR method to structure your response."
            )
        ] * 3,
        resume_feedback="Tailor your resume more closely to the job requirements. Highlight relevant projects and technologies explicitly."
    )
