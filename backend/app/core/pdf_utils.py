import pdfplumber

def extract_text_from_pdf(file_path: str) -> str:
    """
    Opens a PDF file and extracts all text.
    """
    text_content = []
    
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                # Extract text from each page
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text)
        
        # Join all pages into one big string
        return "\n".join(text_content)
    
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""