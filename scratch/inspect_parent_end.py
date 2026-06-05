import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
parent_transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

with open(parent_transcript_path, "r", encoding="utf-8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines[-15:]):
        print(f"Line {len(lines) - 15 + i}:", line[:300])
