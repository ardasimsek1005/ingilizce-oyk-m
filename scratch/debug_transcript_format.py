import json
import os

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        if "generate_image" in line:
            data = json.loads(line)
            if data.get("type") == "CALL_TOOL":
                print(json.dumps(data, indent=2, ensure_ascii=False))
                break
