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
            
            # 2. Ensure the Collection Exists
            try:
                cls.client.get_collection(settings.QDRANT_COLLECTION)
                print(f"Connected to Qdrant Collection: {settings.QDRANT_COLLECTION}")
            except Exception:
                print(f"Collection not found. Creating '{settings.QDRANT_COLLECTION}'...")
                cls.client.create_collection(
                    collection_name=settings.QDRANT_COLLECTION,
                    vectors_config=models.VectorParams(
                        size=384,  # Matches all-MiniLM-L6-v2
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
        Using query_points for compatibility.
        """
        response = self.client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=vector, 
            limit=limit
        )
        return response.points
    
    def delete_job(self, job_id: int):
        """
        Remove a job vector from Qdrant.
        """
        try:
            self.client.delete(
                collection_name=settings.QDRANT_COLLECTION,
                points_selector=models.PointIdsList(
                    points=[job_id]
                )
            )
            print(f"Job {job_id} vector deleted from Qdrant.")
        except Exception as e:
            print(f"Failed to delete vector for job {job_id}: {e}")
            
# Global Instance
vector_db = VectorDB()

