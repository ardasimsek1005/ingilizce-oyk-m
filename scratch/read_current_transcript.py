import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\92db0509-b581-4fef-8712-d7cd61d81b02\.system_generated\logs\transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if i < 10:
            print(f"Line {i}:", line[:300])
        else:
            break
