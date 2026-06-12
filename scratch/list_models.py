import urllib.request
import json
import os

api_key = ""
if os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
req = urllib.request.Request(url, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        res_json = json.loads(response.read().decode("utf-8"))
        print("Supported models:")
        for model in res_json.get("models", []):
            print(f"- {model['name']} (supportedMethods: {model.get('supportedMethods', [])})")
except Exception as e:
    print(f"Error listing models: {e}")
