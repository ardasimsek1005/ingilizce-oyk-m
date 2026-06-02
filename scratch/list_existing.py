import json
import os

files = ["expanded_stories_data.json", "horror_stories_data.json", "classics_stories_data.json"]

existing_titles = []
existing_ids = []

for f_name in files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
            for s_id, story in data.items():
                existing_titles.append(story["title"])
                existing_ids.append(s_id)

print(f"Total existing stories: {len(existing_ids)}")
print("Existing Titles (sorted):")
for t in sorted(existing_titles):
    print(f"  - {t}")
