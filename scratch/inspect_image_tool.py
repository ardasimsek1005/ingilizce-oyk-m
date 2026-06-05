import json
import os

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        if "tool_calls" in data:
            for tc in data["tool_calls"]:
                if tc.get("name") == "generate_image":
                    print("Tool Call:", json.dumps(tc, indent=2))
        if "content" in data and "Generated image is saved at" in data["content"]:
            print("Tool Result:", data["content"])
