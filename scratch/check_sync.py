import json
import re
import os

part1_path = "src/stories_part1.ts"
with open(part1_path, "r", encoding="utf-8") as f:
    ts_content = f.read()

json_files = [
    "expanded_stories_data.json",
    "horror_stories_data.json",
    "classics_stories_data.json",
    "new_30_stories_data.json",
    "daily_stories_data.json",
    "new_20_stories.json"
]

# Find cinderella
s_id = "cinderella"
found_file = None
json_story = None

for f_name in json_files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
        if s_id in data:
            found_file = f_name
            json_story = data[s_id]
            break

if json_story:
    print(f"Found {s_id} in {found_file}")
    # Find in TS
    pattern = r"id:\s*'" + s_id + r"',.*?en:\s*\[(.*?)\]"
    match = re.search(pattern, ts_content, re.DOTALL)
    if match:
        ts_en_block = match.group(1)
        ts_paragraphs = re.findall(r'"([^"]+)"', ts_en_block)
        print(f"cinderella paragraphs in JSON: {len(json_story['en'])}")
        print(f"cinderella paragraphs in TS: {len(ts_paragraphs)}")
        # Compare first paragraph (normalizing escape characters)
        p_json = json_story['en'][0].replace('\\"', '"').replace('\\\\', '\\').strip()
        p_ts = ts_paragraphs[0].replace('\\"', '"').replace('\\\\', '\\').strip() if ts_paragraphs else ""
        print("JSON p0:", p_json[:80])
        print("TS p0:  ", p_ts[:80])
        if p_json != p_ts:
            print("DIFF FOUND!")
        else:
            print("IN SYNC!")
    else:
        print("cinderella not found in TS")
else:
    print("cinderella not found in any JSON")

