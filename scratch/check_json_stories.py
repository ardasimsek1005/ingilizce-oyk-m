import json
import os

json_files = [
    "expanded_stories_data.json",
    "horror_stories_data.json",
    "classics_stories_data.json",
    "new_30_stories_data.json",
    "daily_stories_data.json",
    "new_20_stories.json"
]

for f_name in json_files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
        levels = {}
        for s_id, story in data.items():
            lvl = story.get("level", "Unknown")
            levels[lvl] = levels.get(lvl, 0) + 1
        print(f"{f_name}: {len(data)} stories. Levels: {levels}")
    else:
        print(f"{f_name} does not exist.")
