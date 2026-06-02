import json
import os

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

if not os.path.exists(transcript_path):
    print("Transcript not found at", transcript_path)
    exit(1)

print("Scanning full transcript for generate_image tool calls:")
found_count = 0
with open(transcript_path, "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f):
        try:
            data = json.loads(line)
            # Check for generate_image in tool_calls
            if "tool_calls" in data:
                for tc in data["tool_calls"]:
                    if tc.get("name") == "generate_image":
                        found_count += 1
                        print(f"\n[{found_count}] Line {line_num+1}: generate_image call")
                        print("Arguments:", json.dumps(tc.get("arguments", {}), indent=2, ensure_ascii=False))
            # Check if it was system returning generated image details
            if "content" in data and "Generated image is saved at" in data["content"]:
                print(f"Result for [{found_count}]:", data["content"].strip())
        except Exception as e:
            pass

print(f"\nScan completed. Found {found_count} generate_image calls.")
