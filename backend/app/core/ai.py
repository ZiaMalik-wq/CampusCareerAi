from sentence_transformers import SentenceTransformer
from functools import lru_cache

MODEL_NAME = "all-MiniLM-L6-v2"

@lru_cache()
def get_model():
    """
    Load the SentenceTransformer model on first request.
    Cached for entire app lifecycle.
    """
    print(f"Loading AI model: {MODEL_NAME}")
    return SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    if not text or not text.strip():
        return []

    model = get_model()
    vector = model.encode(text)
    return vector.tolist()
