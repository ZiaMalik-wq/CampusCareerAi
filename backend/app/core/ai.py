from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

class AIModel:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self):
        """Load the model only when needed"""
        if self._model is None:
            print(f"Loading AI Model ({MODEL_NAME})...")
            self._model = SentenceTransformer(MODEL_NAME)
            print("AI Model loaded!")

    def generate_embedding(self, text: str) -> list[float]:
        self._load_model()

        if not text or not text.strip():
            return []

        embedding = self._model.encode(text)
        return embedding.tolist()


# Global singleton, same as before
ai_model = AIModel()
