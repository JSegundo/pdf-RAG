import os
from docling.document_converter import DocumentConverter

class TextExtractor:
    def __init__(self):
        self.converter = DocumentConverter()

    def extract(self, file_path: str) -> dict:
        """
        Extract text and structure from a PDF file using docling
        """
        try:
            print(f"\n=== PDF Extraction Started ===")
            print(f"Processing file: {file_path}")
            
            if not os.path.exists(file_path):
                print(f"✗ File not found: {file_path}")
                raise FileNotFoundError(f"PDF file not found: {file_path}")

            print("✓ File exists, converting PDF...")
            result = self.converter.convert(file_path)

            document = result.document
            markdown_output = document.export_to_markdown()
            json_output = document.export_to_dict()
            
            print("✓ Successfully converted document")
            
            output = {
                'markdown': markdown_output,
                'json': json_output,
                'file_path': file_path,
                'document': document
            }
            
            print("=== PDF Extraction Complete ===\n")
            return output

        except Exception as e:
            print(f"✗ Error extracting text from PDF: {e}")
            print("=== PDF Extraction Failed ===\n")
            raise 