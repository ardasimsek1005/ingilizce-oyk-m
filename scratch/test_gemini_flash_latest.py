import os
import urllib.request
import json

env_path = r"c:\Users\acer\antigravity\i̇ngilizce-öyküm\.env"
api_key = ""
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
headers = {"Content-Type": "application/json"}
data = {
    "contents": [{"parts": [{"text": "Hello, write a 5 word sentence."}]}]
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Body:", e.read().decode("utf-8"))
