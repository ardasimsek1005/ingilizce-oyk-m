import json
import re
import os

json_files = [
    "expanded_stories_data.json",
    "horror_stories_data.json",
    "classics_stories_data.json",
    "new_30_stories_data.json",
    "daily_stories_data.json",
    "new_20_stories.json"
]

all_json_ids = set()
for f_name in json_files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
        all_json_ids.update(data.keys())

print(f"Total unique story IDs in all JSON files: {len(all_json_ids)}")

def check_ts_ids(path):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    ts_ids = re.findall(r"id:\s*'([^']+)'", content)
    not_in_json = [i for i in ts_ids if i not in all_json_ids]
    print(f"{path}: {len(ts_ids)} stories. {len(not_in_json)} not in JSON database. Examples: {not_in_json[:15]}")

check_ts_ids("src/stories_part1.ts")
check_ts_ids("src/stories_part2.ts")
