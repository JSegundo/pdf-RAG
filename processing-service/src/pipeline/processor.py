from typing import List
import PyPDF2
from io import BytesIO

class DocumentProcessor:
    def __init__(self):
        self.supported_types = ['pdf']

    def process_pdf(self, file_content: bytes) -> str:
        pdf_file = BytesIO(file_content)
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

    def process(self, file_content: bytes, file_type: str) -> str:
        if file_type not in self.supported_types:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        if file_type == 'pdf':
            return self.process_pdf(file_content) 