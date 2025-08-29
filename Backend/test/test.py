# backend/test_full_api.py
import requests
import os
import time

# --- Configuration ---
BASE_URL = "http://localhost:8000/api/query"

def test_text_query():
    """Tests the text search endpoint.
    We will request a model that is DIFFERENT from the default one
    to test the dynamic model loading logic.
    """
    print("\n--- 1. Testing Text Query API ---")
    url = f"{BASE_URL}/text"
    
    payload = {
        "model": "ViT-L-14",  # Not the default, to trigger a model load
        "metric": "cosine",
        "topK": 3,
        "queryText": "a person riding a bicycle"
    }
    
    print(f"Requesting with model: {payload['model']}")
    
    try:
        start_time = time.time()
        response = requests.post(url, json=payload, timeout=120) # 2 min timeout
        response.raise_for_status()
        end_time = time.time()
        
        print(f"✅ Text Query SUCCESS in {end_time - start_time:.2f} seconds.")
        print("Response:", response.json())
        
    except Exception as e:
        print(f"❌ Text Query FAILED: {e}")
        if 'response' in locals():
            print("Server Response Body:", response.text)


def test_image_query():
    """Tests the image search endpoint with a dummy image."""
    print("\n--- 2. Testing Image Query API ---")
    url = f"{BASE_URL}/image"
    
    test_image_name = '2117.jpg'
    test_image_path = os.path.join(os.path.dirname(__file__), test_image_name)
    
    form_data = {
        "model": (None, "ViT-H-14-quickgelu"),
        "metric": (None, "l2"),
        "topK": (None, "3"),
    }
    
    files = {
        "image": (test_image_name, open(test_image_path, "rb"), "image/jpeg")
    }
    
    print(f"Requesting with model: {form_data['model'][1]}")

    try:
        start_time = time.time()
        response = requests.post(url, data=form_data, files=files, timeout=120)
        response.raise_for_status()
        end_time = time.time()
        
        print(f"✅ Image Query SUCCESS in {end_time - start_time:.2f} seconds.")
        print("Response:", response.json())

    except Exception as e:
        print(f"❌ Image Query FAILED: {e}")
        if 'response' in locals():
            print("Server Response Body:", response.text)
            
    finally:
        files["image"][1].close()

def test_ocr_query():
    """Tests the OCR search endpoint."""
    print("\n--- 3. Testing OCR Query API ---")
    url = f"{BASE_URL}/ocr"
    
    # Note: The model/metric are required by the schema but ignored by the OCR logic
    payload = {
        "model": "ocr", 
        "metric": "text-match",
        "topK": 5,
        "queryText": "warning" # A sample word to search for in your OCR data
    }
    
    print(f"Requesting with query: '{payload['queryText']}'")
    
    try:
        start_time = time.time()
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        end_time = time.time()
        
        print(f"✅ OCR Query SUCCESS in {end_time - start_time:.2f} seconds.")
        print("Response:", response.json())
        
    except Exception as e:
        print(f"❌ OCR Query FAILED: {e}")
        if 'response' in locals():
            print("Server Response Body:", response.text)

if __name__ == "__main__":
    print("Starting full API test suite...")
    # Make sure your FastAPI server is running before executing this script!
    test_text_query()
    test_image_query()
    test_ocr_query()
    print("\nAll tests completed.")