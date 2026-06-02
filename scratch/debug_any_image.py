import json
import os

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        if "generate_image" in line:
            data = json.loads(line)
            print("Keys:", list(data.keys()))
            print("Type:", data.get("type"))
            print("Source:", data.get("source"))
            if "tool_calls" in data:
                print("Tool calls sample:")
                print(json.dumps(data["tool_calls"], indent=2, ensure_ascii=False)[:1000])
            elif "tool_calls" in data.get("content", ""):
                print("Tool calls in content:")
                print(data["content"][:1000])
            else:
                print("Content sample:")
                print(json.dumps(data.get("content", ""), indent=2, ensure_ascii=False)[:500])
            break
