import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
parent_transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

with open(parent_transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        # Look for system or user input containing tool definitions
        if "tools" in str(data) or "declarations" in str(data):
            print("Found tools/declarations in line type:", data.get("type"))
            # print first 1000 chars of line
            print(json.dumps(data, indent=2)[:1000])
            print("="*40)
            # Break if we find declarations
            if "generate_image" in str(data):
                print("Found generate_image in this line!")
                # Print the tool declaration specifically
                break
