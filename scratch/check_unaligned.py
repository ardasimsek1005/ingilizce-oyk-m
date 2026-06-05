import json
import os

progress_path = "scratch/vocabulary_correction_progress.json"
progress = {"processed": []}
if os.path.exists(progress_path):
    with open(progress_path, "r", encoding="utf-8") as f:
        progress = json.load(f)

processed_ids = set(progress.get("processed", []))

json_files = [
    "expanded_stories_data.json",
    "horror_stories_data.json",
    "classics_stories_data.json",
    "new_30_stories_data.json",
    "daily_stories_data.json",
    "new_20_stories.json"
]

unaligned = []
all_a1_a2 = []

for f_name in json_files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
        for s_id, story in data.items():
            lvl = story.get("level")
            if lvl in ["A1", "A2"]:
                all_a1_a2.append((s_id, lvl, f_name))
                if s_id not in processed_ids:
                    unaligned.append((s_id, lvl, f_name))

print(f"Total A1/A2 stories in JSON: {len(all_a1_a2)}")
print(f"Unaligned/Unprocessed A1/A2 stories: {len(unaligned)}")
for item in unaligned:
    print(f"  - {item[0]} (Level: {item[1]}, File: {item[2]})")
