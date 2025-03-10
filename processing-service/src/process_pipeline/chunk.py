from typing import List
from docling.chunking import HybridChunker
from utils.tokenizer import OpenAITokenizerWrapper

class TextChunker:
    def __init__(self):
        """Initialize the text chunker with HybridChunker from docling"""
        self.tokenizer = OpenAITokenizerWrapper()
        self.chunker = HybridChunker(
            tokenizer=self.tokenizer,
            max_tokens=8191,  # text-embedding-3-large's maximum context length
            merge_peers=True,
        )

    def chunk_text(self, document):
        if not document:
            raise ValueError("The input document is empty or invalid.")
        
        try:
            chunk_iter = self.chunker.chunk(dl_doc=document)
            chunks = list(chunk_iter)
            
            if not chunks:
                print("Warning: Chunking resulted in an empty list of chunks.")
                print(f"Input document: {document}")  # Log the input for debugging
            
            return chunks
        except Exception as e:
            print(f"Error during chunking: {e}")
            raise
