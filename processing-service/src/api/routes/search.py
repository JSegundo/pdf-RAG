# processing-service/src/api/routes/search.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import logging

from rag.search import VectorSearch
from storage.db_manager import DatabaseManager, get_db_manager
from ..models.schemas import SearchRequest, SearchResponse, SearchResult# from models.schemas import SearchRequest, SearchResponse, SearchResult

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["search"])

# Dependency for vector search service
def get_vector_search(db_manager: DatabaseManager = Depends(get_db_manager)) -> VectorSearch:
    """Dependency to get vector search service"""
    return VectorSearch(db_manager)

@router.post("/search", response_model=SearchResponse)
async def search(
    request: SearchRequest,
    vector_search: VectorSearch = Depends(get_vector_search)
):
    """
    Search for relevant text chunks using vector similarity
    
    This endpoint takes a search query and returns the most relevant chunks
    from the document store based on semantic similarity.
    """
    try:
        logger.info(f"Search request received: {request.query}")
        
        # Validate inputs
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
        # Get search results
        results = vector_search.search(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k,
            min_score=request.min_score
        )
        
        # Convert to response model format
        search_results = []
        for result in results:
            search_results.append(
                SearchResult(
                    id=result["id"],
                    document_id=result["document_id"],
                    text=result["text"],
                    score=result["score"],
                    metadata=result.get("metadata")
                )
            )
        
        return SearchResponse(
            results=search_results,
            query=request.query,
            total=len(search_results)
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Search error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")