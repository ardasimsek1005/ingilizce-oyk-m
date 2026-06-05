import os
import urllib.request
import json
import base64

env_path = r"c:\Users\acer\antigravity\i̇ngilizce-öyküm\.env"
api_key = ""
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"
headers = {"Content-Type": "application/json"}
data = {
    "instances": [
        {"prompt": "A cute 3D Pixar style illustration of a small ginger cat wearing glasses and reading a tiny book, cozy indoor background, warm lighting, round frame friendly"}
    ],
    "parameters": {
        "sampleCount": 1,
        "outputMimeType": "image/png",
        "aspectRatio": "1:1"
    }
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode("utf-8"))
        print("Keys in response:", list(res.keys()))
        if "predictions" in res:
            print("Number of predictions:", len(res["predictions"]))
            # Save the image
            img_data = res["predictions"][0]["bytesBase64Encoded"]
            with open("test_cat.png", "wb") as f_out:
                f_out.write(base64.b64decode(img_data))
            print("Successfully saved test_cat.png!")
        else:
            print("Response:", json.dumps(res, indent=2))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Body:", e.read().decode("utf-8"))
