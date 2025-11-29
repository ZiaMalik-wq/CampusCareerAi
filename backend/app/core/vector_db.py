from qdrant_client import QdrantClient
from qdrant_client.http import models
from functools import lru_cache
from app.core.config import settings


@lru_cache()
def get_qdrant():
    """
    Connect to Qdrant cloud ONLY when first needed.
    Cached globally.
    """
    print("Connecting to Qdrant Cloud...")
    
    client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    )

    # Ensure collection exists
    try:
        client.get_collection(settings.QDRANT_COLLECTION)
        print(f"Collection OK: {settings.QDRANT_COLLECTION}")
    except Exception:
        print(f"Collection missing. Creating {settings.QDRANT_COLLECTION}...")
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION,
            vectors_config=models.VectorParams(
                size=384,
                distance=models.Distance.COSINE
            )
        )
        print("Collection created.")

    return client


def qdrant_upsert(job_id: int, vector: list[float], metadata: dict):
    client = get_qdrant()
    client.upsert(
        collection_name=settings.QDRANT_COLLECTION,
        points=[
            models.PointStruct(
                id=job_id,
                vector=vector,
                payload=metadata
            )
        ]
    )
    print(f"Vector saved for job {job_id}")


def qdrant_search(vector: list[float], limit: int = 5):
    client = get_qdrant()
    result = client.query_points(
        collection_name=settings.QDRANT_COLLECTION,
        query=vector,
        limit=limit
    )
    return result.points


def qdrant_delete(job_id: int):
    client = get_qdrant()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION,
        points_selector=models.PointIdsList(points=[job_id])
    )
    print(f"Vector deleted for job {job_id}")
