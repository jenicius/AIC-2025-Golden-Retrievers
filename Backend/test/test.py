import requests
import time


API_URL = "http://localhost:8000/api/query/text"

PAYLOAD = {
    "model": "ViT-L-14-quickgelu", 
    "metric": "cosine",
    "topK": 5,
    "queryText": "A lantern butterfly"
}

def run_test():
    """
    Sends a POST request to the text search API and prints the response.
    """
    print("--- Testing Live Text Search API Endpoint ---")
    print(f"Sending request to: {API_URL}")
    print(f"Payload: {PAYLOAD}")

    try:
        start_time = time.time()
        
        response = requests.post(API_URL, json=PAYLOAD, timeout=60) 
        
        response.raise_for_status()
        
        end_time = time.time()
        
        print(f"\nSUCCESS! Request completed in {end_time - start_time:.2f} seconds.")
        print("Status Code:", response.status_code)
        
        results = response.json()
        print("\n--- Search Results ---")
        for i, item in enumerate(results.get('results', [])):
             print(f"Result {i+1}:")
             print(f"  - Video Name: {item.get('video_name')}")
             print(f"  - ID: {item.get('id')}")
             print(f"  - YouTube ID: {item.get('youtube_id')}")
             print(f"  - Start Time: {item.get('start_time')} seconds")

    except requests.exceptions.Timeout:
        print("\nFAILED: The request timed out. The server might be too slow to respond.")
    except requests.exceptions.HTTPError as http_err:
        print(f"\nFAILED: HTTP Error occurred: {http_err}")
        print("Server Response Body:", response.text)
    except requests.exceptions.ConnectionError as conn_err:
        print(f"\nFAILED: Connection Error. Is the backend server running?")
        print(f"Details: {conn_err}")
    except Exception as err:
        print(f"\nFAILED: An unexpected error occurred: {err}")

# --- Run the test ---
if __name__ == "__main__":
    run_test()