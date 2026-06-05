import json
import os

json_files = [f for f in os.listdir(".") if f.endswith(".json") and f not in ["package.json", "package-lock.json", "tsconfig.json", "users_data.json", "metadata.json"]]

print("Checking files:", json_files)

for jf in json_files:
    with open(jf, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error loading {jf}: {e}")
            continue
        
        if not isinstance(data, dict):
            continue
            
        for story_id, story in data.items():
            if not isinstance(story, dict):
                continue
            en = story.get("en", [])
            tr = story.get("tr", [])
            if len(en) != len(tr):
                print(f"Mismatch in {jf} -> {story_id}: EN={len(en)}, TR={len(tr)}")
