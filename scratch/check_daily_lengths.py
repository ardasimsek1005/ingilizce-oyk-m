import json

with open("daily_stories_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for story_id, story in data.items():
    en_len = len(story.get("en", []))
    tr_len = len(story.get("tr", []))
    if en_len != tr_len:
        print(f"Mismatch: {story_id} - EN: {en_len}, TR: {tr_len}")
