import json
import re
import os

part1_path = "src/stories_part1.ts"
part2_path = "src/stories_part2.ts"

with open(part1_path, "r", encoding="utf-8") as f:
    content1 = f.read()

with open(part2_path, "r", encoding="utf-8") as f:
    content2 = f.read()

ts_content = content1 + "\n" + content2

json_files = [
    "expanded_stories_data.json",
    "horror_stories_data.json",
    "classics_stories_data.json",
    "new_30_stories_data.json",
    "daily_stories_data.json",
    "new_20_stories.json"
]

diff_count = 0
for f_name in json_files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
        for s_id, story in data.items():
            # Find in TS
            pattern = r"id:\s*'" + s_id + r"',.*?en:\s*\[(.*?)\]"
            match = re.search(pattern, ts_content, re.DOTALL)
            if match:
                ts_en_block = match.group(1)
                ts_paragraphs = re.findall(r'"([^"]+)"', ts_en_block)
                if not ts_paragraphs:
                    # Try single quotes
                    ts_paragraphs = re.findall(r"'([^']+)'", ts_en_block)
                
                # Check first paragraph
                if ts_paragraphs and len(story["en"]) > 0:
                    p_json = story["en"][0].replace('\\"', '"').replace('\\\\', '\\').replace("'", "\\'").strip()
                    p_ts = ts_paragraphs[0].replace('\\"', '"').replace('\\\\', '\\').replace("'", "\\'").strip()
                    # Strip spaces and compare
                    # let's just do a simple comparison after removing non-alphabetic chars
                    p_json_clean = re.sub(r'[^a-zA-Z]', '', p_json).lower()
                    p_ts_clean = re.sub(r'[^a-zA-Z]', '', p_ts).lower()
                    if p_json_clean != p_ts_clean:
                        print(f"Diff in {s_id} (File: {f_name})")
                        print("  JSON:", p_json[:100])
                        print("  TS:  ", p_ts[:100])
                        diff_count += 1
                        if diff_count <= 5:
                            pass # show more if needed

print(f"Total out-of-sync stories: {diff_count}")
