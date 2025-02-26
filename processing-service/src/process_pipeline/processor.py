from typing import Dict
from process_pipeline.extract import TextExtractor
from process_pipeline.chunk import TextChunker
from process_pipeline.embed import TextEmbedder  # We'll create this next

class DocumentProcessor:
    def __init__(self, db_config: Dict):
        """
        Initialize the complete document processing pipeline
        """
        print("\n=== Initializing Document Processor ===")
        self.extractor = TextExtractor()
        self.chunker = TextChunker()
        self.embedder = TextEmbedder(db_config)
        print("✓ Initialized all pipeline components")
        print("=== Initialization Complete ===\n")

    def process_document(self, file_path: str, metadata: Dict = None) -> Dict:
        """
        Run the complete document processing pipeline:
        1. Extract text and structure using docling
        2. Chunk the extracted text
        3. Create and store embeddings
        
        Args:
            file_path: Path to the document file
            metadata: Additional document metadata
            
        Returns:
            Dict containing processing results and status
        """
        try:
            print("\n=== Starting Document Processing Pipeline ===")
            print(f"Processing file: {file_path}")
            
            # Step 1: Extract text using docling
            print("Step 1: Extracting text...")
            extracted_data = self.extractor.extract(file_path)
            document = extracted_data['document']
            # Get structured data
            json_data = extracted_data['json']
                        
            # Step 2: Chunk the text
            print("\nStep 2: Chunking text...")
            chunks = self.chunker.chunk_text(document)
            print(f"✓ Created {len(chunks)} chunks")
            
            # Step 3: Create and store embeddings
            print("\nStep 3: Creating embeddings...")
            # Combine metadata with document info
            enhanced_metadata = {
                **(metadata or {}),
                'title': json_data.get('title'),
                'document_structure': json_data
            }
            
            processed_chunks = self.embedder.create_embeddings(
                chunks=chunks,
                metadata=enhanced_metadata
            )
            print(f"✓ Created and stored embeddings for {len(processed_chunks)} chunks")
            
            print("=== Document Processing Complete ===\n")
            return {
                'status': 'success',
                'document_info': {
                    'title': json_data.get('title'),
                    'num_chunks': len(chunks),
                    'metadata': enhanced_metadata
                }
            }
            
        except Exception as e:
            print(f"✗ Error in document processing pipeline: {e}")
            print("=== Document Processing Failed ===\n")
            raise