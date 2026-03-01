import requests
import base64
import time

url = "http://127.0.0.1:8000/api/v1/analyze"

with open("README.md", "rb") as f:
    content = f.read()

payload = {
    "file_base64": base64.b64encode(content).decode("utf-8"),
    "filename": "README.md",
    "options": {"extract_figures": True, "generate_grant": True}
}

print("Starting upload...")
response = requests.post(url, json=payload)
print("Response:", response.status_code)
print(response.json())
