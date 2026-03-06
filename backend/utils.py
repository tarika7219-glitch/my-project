import PyPDF2
import re
from typing import Dict, List

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_text_from_file(file_path: str, file_type: str = 'pdf') -> str:
    """Extract text from various file formats"""
    if file_type == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_type == 'txt':
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def clean_text(text: str) -> str:
    """Clean extracted text"""
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text
