import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file in memory (bytes).
    """
    text_content = []
    
    try:
        print(f"PDF Size: {len(file_bytes)} bytes") # Debug log
        
        # Wrap bytes in BytesIO
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            print(f"Found {len(pdf.pages)} pages") # Debug log
            
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    # Clean up text slightly
                    text = text.strip()
                    text_content.append(text)
                    print(f"Page {i+1}: Extracted {len(text)} chars")
                else:
                    print(f"Page {i+1}: No text found (Image?)")
        
        full_text = "\n".join(text_content)
        return full_text
    
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""