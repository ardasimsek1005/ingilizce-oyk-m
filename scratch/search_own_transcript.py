import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\1163c924-fb24-4991-a8ee-902db162c86f\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        try:
            data = json.loads(line)
            if data.get("type") == "USER_INPUT":
                print(f"[{data.get('step_index')}] USER: {data.get('content')}")
        except Exception as e:
            pass
