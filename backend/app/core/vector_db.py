from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.config import settings

class VectorDB:
    _instance = None
    client = None

    def __new__(cls):
        if cls._instance is None:
            print("To setup Qdrant Connection...")
            cls._instance = super(VectorDB, cls).__new__(cls)
            
            # 1. Connect to Qdrant Cloud
            cls.client = QdrantClient(
                url=settings.QDRANT_URL, 
                api_key=settings.QDRANT_API_KEY
            )
            
            # 2. Ensure the Collection Exists (Auto-setup)
            # We check if 'campus_career_jobs' exists. If not, we create it.
            try:
                cls.client.get_collection(settings.QDRANT_COLLECTION)
                print(f"Connected to Qdrant Collection: {settings.QDRANT_COLLECTION}")
            except Exception:
                print(f"Collection not found. Creating '{settings.QDRANT_COLLECTION}'...")
                cls.client.create_collection(
                    collection_name=settings.QDRANT_COLLECTION,
                    vectors_config=models.VectorParams(
                        size=384,  # Must match AI model (all-MiniLM-L6-v2)
                        distance=models.Distance.COSINE
                    )
                )
                print("Collection created successfully!")

        return cls._instance

    def upsert_job(self, job_id: int, vector: list[float], metadata: dict):
        """
        Save a job embedding to Qdrant.
        """
        self.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=[
                models.PointStruct(
                    id=job_id,
                    vector=vector,
                    payload=metadata
                )
            ]
        )
        print(f"Job {job_id} vector saved to Qdrant.")

    def search(self, vector: list[float], limit: int = 5):
        """
        Find similar jobs based on a query vector.
        """
        results = self.client.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=vector,
            limit=limit
        )
        return results

# Global Instance
vector_db = VectorDB()