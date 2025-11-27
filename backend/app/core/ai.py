from sentence_transformers import SentenceTransformer

# We use "all-MiniLM-L6-v2". 
# It is fast, lightweight (80MB), and excellent for semantic search.
MODEL_NAME = "all-MiniLM-L6-v2"

class AIModel:
    _instance = None
    model = None

    def __new__(cls):
        """
        Singleton pattern to ensure model is loaded only once.
        """
        if cls._instance is None:
            print(f"Loading AI Model ({MODEL_NAME})... this may take a moment.")
            cls._instance = super(AIModel, cls).__new__(cls)
            # Load the model from HuggingFace
            cls.model = SentenceTransformer(MODEL_NAME)
            print("AI Model loaded successfully!")
        return cls._instance

    def generate_embedding(self, text: str) -> list[float]:
        """
        Converts text into a vector (list of 384 numbers).
        """
        if not text or not text.strip():
            return []
            
        # The model returns a numpy array, we convert to standard list for JSON/DB
        embedding = self.model.encode(text)
        return embedding.tolist()

# Global instance
ai_model = AIModel()