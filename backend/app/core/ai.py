from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

class AIModel:
    _instance = None
    model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIModel, cls).__new__(cls)
            # DO NOT LOAD MODEL HERE. Just create the instance.
        return cls._instance

    def _load_model(self):
        """Load the model ONLY when it is actually needed"""
        if self.model is None:
            print(f"Loading AI Model ({MODEL_NAME})...")
            self.model = SentenceTransformer(MODEL_NAME)
            print("AI Model loaded!")

    def generate_embedding(self, text: str) -> list[float]:
        # Trigger the load here (Lazy Loading)
        self._load_model()
        
        if not text or not text.strip():
            return []
        
        # Convert to standard list (not numpy)
        embedding = self.model.encode(text)
        return embedding.tolist()

ai_model = AIModel()