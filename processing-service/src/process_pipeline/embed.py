from typing import List, Dict
import os
import uuid
from openai import OpenAI
import psycopg2
from psycopg2.extras import execute_values
import numpy as np
import json
class TextEmbedder:
    def __init__(self, db_config: Dict):
        """
        Initialize the embedder with OpenAI client and PostgreSQL connection
        
        Args:
            db_config: Dictionary with PostgreSQL connection details
        """
        # Initialize OpenAI client
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        # Initialize PostgreSQL connection
        self.conn = psycopg2.connect(**db_config)
        
        # Create necessary database structures
        self._init_database()
    
    def _init_database(self):
        """Initialize PostgreSQL database with pgvector extension and tables"""
        with self.conn.cursor() as cur:
            # Enable pgvector extension
            cur.execute('CREATE EXTENSION IF NOT EXISTS vector')
            
            # Create documents table
            cur.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create chunks table with vector support
            cur.execute('''
                CREATE TABLE IF NOT EXISTS chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER REFERENCES documents(id),
                    chunk_text TEXT,
                    embedding vector(1536),
                    page_numbers INTEGER[],
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            self.conn.commit()

    def create_embeddings(self, chunks: List, metadata: Dict = None) -> List[Dict]:
        """
        Create embeddings for text chunks and store them in PostgreSQL with pgvector.

        Args:
            chunks: A list of DocChunk objects. Each DocChunk contains text and metadata.
            metadata: Additional metadata for the document (optional).

        Returns:
            A list of dictionaries, where each dictionary represents a processed chunk.
        """
        if not chunks:
            raise ValueError("The chunks list is empty.")

        # First, create a document record in the database
        with self.conn.cursor() as cur:
            cur.execute(
                'INSERT INTO documents (filename) VALUES (%s) RETURNING id',
                (metadata.get('filename'),)
            )
            document_id = cur.fetchone()[0]  # Get the ID of the newly inserted document

        # Process chunks into a structured format
        processed_chunks = []
        for i, chunk in enumerate(chunks):
            # Generate embeddings for the chunk text
            response = self.client.embeddings.create(
                model="text-embedding-3-large",
                input=chunk.text,
                dimensions=1536
            )
            embedding = response.data[0].embedding  # Get the embedding vector
            
            # Prepare the chunk data for insertion
            processed_chunk = {
                "document_id": document_id,
                "chunk_text": chunk.text,
                "embedding": embedding,
                "page_numbers": sorted(
                    set(
                        prov.page_no
                        for item in chunk.meta.doc_items
                        for prov in item.prov
                    )
                )
                or None,
                "metadata": {
                    "filename": chunk.meta.origin.filename,
                    "title": chunk.meta.headings[0] if chunk.meta.headings else None,
                },
            }
            processed_chunks.append(processed_chunk)

        # Insert the processed chunks into the database
        try:
            with self.conn.cursor() as cur:
                # Prepare the data for insertion
                data = [
                    (
                        chunk["document_id"],
                        chunk["chunk_text"],
                        chunk["embedding"],
                        chunk["page_numbers"],
                        json.dumps(chunk["metadata"])
                    )
                    for chunk in processed_chunks
                ]

                # Use execute_values for efficient bulk insertion
                execute_values(
                    cur,
                    '''
                    INSERT INTO chunks 
                    (document_id, chunk_text, embedding, page_numbers, metadata)
                    VALUES %s
                    ''',
                    data
                )

            # Commit the transaction
            self.conn.commit()
        except Exception as e:
            # Rollback the transaction in case of an error
            self.conn.rollback()
            print(f"Error adding chunks to database: {e}")
            raise

        return processed_chunks

    def search_similar(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search for similar chunks using vector similarity
        
        Args:
            query: Text to search for
            limit: Maximum number of results to return
            
        Returns:
            List of similar chunks with their metadata
        """
        # Get embedding for query
        response = self.client.embeddings.create(
            model="text-embedding-3-large",
            input=[query]
        )
        query_embedding = response.data[0].embedding
        
        # Search using cosine similarity
        with self.conn.cursor() as cur:
            cur.execute('''
                SELECT 
                    chunk_text,
                    metadata,
                    1 - (embedding <=> %s) as similarity
                FROM chunks
                ORDER BY embedding <=> %s
                LIMIT %s
            ''', (query_embedding, query_embedding, limit))
            
            results = cur.fetchall()
            
        return [
            {
                'text': row[0],
                'metadata': row[1],
                'similarity': row[2]
            }
            for row in results
        ]