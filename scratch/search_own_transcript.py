import json
import os

log_dir = "C:\\Users\\acer\\.gemini\\antigravity\\brain\\10fee2c6-bb20-4f93-b938-314bd550cc65\\.system_generated\\logs"
transcript_path = os.path.join(log_dir, "transcript.jsonl")

if not os.path.exists(transcript_path):
    print("Transcript not found at", transcript_path)
else:
    print("Searching transcript...")
    keywords = ["kelime", "sözlük", "offline", "çevrimdışı", "dictionary", "translate"]
    
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                step = json.loads(line)
                content = step.get("content", "")
                # check if any keyword matches
                if any(kw in content.lower() for kw in keywords) and step.get("source") == "USER_EXPLICIT":
                    print(f"Step {step.get('step_index')}: Source: USER")
                    print(f"  Content: {content[:300]}")
            except Exception as e:
                pass
