# processing-service/src/storage/db.py
import os
import logging
from typing import Dict, Any, Optional
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    Database connection manager with connection pooling
    
    This class manages a pool of PostgreSQL connections to optimize
    performance and resource usage.
    """
    _instance = None
    
    @classmethod
    def get_instance(cls) -> 'DatabaseManager':
        """Singleton access method"""
        if cls._instance is None:
            cls._instance = DatabaseManager()
        return cls._instance
    
    def __init__(self):
        """Initialize the database connection pool"""
        # Only create pool if this is the first initialization
        if DatabaseManager._instance is not None:
            return
            
        self.db_params = {
            'host': os.getenv('DB_HOST', 'postgres'),
            'port': os.getenv('DB_PORT', '5432'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'yourpassword'),
            'dbname': os.getenv('DB_NAME', 'ragdb')
        }
        
        # Initialize connection pool
        min_connections = int(os.getenv('DB_MIN_CONNECTIONS', '1'))
        max_connections = int(os.getenv('DB_MAX_CONNECTIONS', '10'))
        
        self.pool = None
        self._create_pool(min_connections, max_connections)
        
        # Verify database setup
        self._verify_database_setup()
    
    def _create_pool(self, min_conn: int, max_conn: int) -> None:
        """Create a new connection pool"""
        try:
            logger.info(f"Creating database connection pool (min={min_conn}, max={max_conn})")
            logger.info(f"Connecting to PostgreSQL at {self.db_params['host']}:{self.db_params['port']}/{self.db_params['dbname']}")
            
            self.pool = pool.ThreadedConnectionPool(
                min_conn,
                max_conn,
                **self.db_params
            )
            
            logger.info("Database connection pool created successfully")
        except Exception as e:
            logger.error(f"Error creating database connection pool: {e}", exc_info=True)
            raise
    
    def _verify_database_setup(self) -> None:
        """Verify that necessary database objects exist"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor() as cur:
                # Check for vector extension
                cur.execute("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')")
                vector_exists = cur.fetchone()[0]
                if not vector_exists:
                    logger.warning("Vector extension is not installed in the database")
                
                # Check if tables exist
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' AND table_name = 'documents'
                    )
                """)
                documents_exists = cur.fetchone()[0]
                
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' AND table_name = 'chunks'
                    )
                """)
                chunks_exists = cur.fetchone()[0]
                
                if not documents_exists or not chunks_exists:
                    logger.warning("Required database tables don't exist. They should be created by init.sql.")
                else:
                    logger.info("Database tables verified: documents and chunks tables exist")
                    
        except Exception as e:
            logger.error(f"Error verifying database setup: {e}", exc_info=True)
        finally:
            if conn:
                self.return_connection(conn)
    
    def get_connection(self):
        """Get a connection from the pool"""
        if not self.pool:
            self._create_pool(1, 10)
        
        try:
            return self.pool.getconn()
        except Exception as e:
            logger.error(f"Error getting connection from pool: {e}", exc_info=True)
            raise
    
    def return_connection(self, conn):
        """Return a connection to the pool"""
        if self.pool:
            self.pool.putconn(conn)
    
    def execute_query(self, query: str, params: tuple = None, 
                      fetch_one: bool = False, 
                      dict_cursor: bool = False) -> Any:
        """
        Execute a query and return results
        
        Args:
            query: SQL query string
            params: Query parameters
            fetch_one: Whether to fetch one result or all results
            dict_cursor: Whether to use a dictionary cursor
            
        Returns:
            Query results
        """
        conn = None
        try:
            conn = self.get_connection()
            
            cursor_factory = RealDictCursor if dict_cursor else None
            with conn.cursor(cursor_factory=cursor_factory) as cur:
                cur.execute(query, params)
                
                if query.strip().upper().startswith(('SELECT', 'WITH')):
                    if fetch_one:
                        return cur.fetchone()
                    else:
                        return cur.fetchall()
                else:
                    conn.commit()
                    return cur.rowcount
                    
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Error executing query: {e}", exc_info=True)
            raise
        finally:
            if conn:
                self.return_connection(conn)
    
    def close(self):
        """Close the connection pool"""
        if self.pool:
            self.pool.closeall()
            logger.info("Database connection pool closed")

# Convenience function to get the DB manager instance
def get_db_manager() -> DatabaseManager:
    return DatabaseManager.get_instance()