import json
import os

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

if not os.path.exists(transcript_path):
    print("Transcript not found at", transcript_path)
    exit(1)

print("Searching transcript for generate_image tool calls...")
with open(transcript_path, "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f):
        try:
            data = json.loads(line)
            if "tool_calls" in data:
                for tc in data["tool_calls"]:
                    if tc.get("name") == "generate_image" or "generate_image" in str(tc):
                        print(f"\n--- Line {line_num+1} ---")
                        print("Arguments:", json.dumps(tc.get("arguments", tc), indent=2, ensure_ascii=False))
            # Also search for text references to prompts or style
            elif "content" in data and any(word in data["content"].lower() for word in ["pixar", "generate_image", "style"]):
                print(f"\n--- Line {line_num+1} (Text content) ---")
                print("Content excerpt:", data["content"][:300])
        except Exception as e:
            pass
