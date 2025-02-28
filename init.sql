-- init.sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chunks table with vector support
CREATE TABLE IF NOT EXISTS chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    chunk_text TEXT,
    embedding vector(1536),
    page_numbers INTEGER[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for similarity search
CREATE INDEX IF NOT EXISTS chunks_embedding_idx 
ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);


-- When implementing S3 uploads:
    -- CREATE TABLE IF NOT EXISTS documents (
    --     id SERIAL PRIMARY KEY,
    --     filename TEXT NOT NULL,
    --     original_filename TEXT,
    --     s3_key TEXT,
    --     s3_bucket TEXT,
    --     file_size BIGINT,
    --     file_type TEXT,
    --     is_processed BOOLEAN DEFAULT FALSE,
    --     processing_started_at TIMESTAMP,
    --     processing_completed_at TIMESTAMP,
    --     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- );