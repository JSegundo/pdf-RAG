# processing-service/src/api/routes/health.py
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
import time
import logging

from storage.db_manager import DatabaseManager, get_db_manager

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check(db_manager: DatabaseManager = Depends(get_db_manager)):

    """Health check endpoint with database connection check"""

    try:
        # Test database connection
        db_manager.execute_query("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": time.time()
        }
    
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": time.time()
            }
        )