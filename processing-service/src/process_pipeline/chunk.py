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
        """
        Split text into chunks using HybridChunker
        
        Args:
            text: The input text to be chunked
            
        Returns:
            List of text chunks
        """

        try:
            chunk_iter = self.chunker.chunk(dl_doc=document)
        except Exception as e:
            print(f"Error during chunking: {e}")
            raise       
                 
        chunks = list(chunk_iter)
        # return [chunk.text for chunk in chunks]
        return chunks

