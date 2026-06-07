import os
import urllib.request
import json
import base64

api_key = ""
if os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

if not api_key:
    print("No API Key found in .env!")
    exit(1)

# Check available models
model = "models/imagen-4.0-fast-generate-001"
# Let's test the predict endpoint
url = f"https://generativelanguage.googleapis.com/v1beta/{model}:predict?key={api_key}"
headers = {"Content-Type": "application/json"}

# Body structure for Imagen predict in Google AI Studio
data = {
    "instances": [
        {"prompt": "A Pixar-style 3D rendered character of a cute robot, square, white background"}
    ],
    "parameters": {
        "sampleCount": 1,
        "aspectRatio": "1:1",
        "outputMimeType": "image/jpeg"
    }
}

req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
try:
    with urllib.request.urlopen(req, timeout=30) as response:
        res = json.loads(response.read().decode("utf-8"))
        print("Success!")
        predictions = res.get("predictions", [])
        if predictions:
            img_b64 = predictions[0].get("bytesBase64Encoded")
            if img_b64:
                img_data = base64.b64decode(img_b64)
                with open("scratch/test_imagen.jpg", "wb") as f:
                    f.write(img_data)
                print(f"Saved generated image: {len(img_data)} bytes.")
            else:
                print("No image bytes found in predictions.")
        else:
            print("No predictions returned.")
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        try:
            print("Error details:")
            print(e.read().decode("utf-8"))
        except:
            pass
