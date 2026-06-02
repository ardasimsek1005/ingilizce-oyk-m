import json
import os

files = ["expanded_stories_data.json", "horror_stories_data.json", "classics_stories_data.json"]

print("Analyzing database...")
for f_name in files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"\nFile: {f_name} ({len(data)} stories)")
            levels = {}
            for s_id, story in data.items():
                lvl = story.get("level", "Unknown")
                levels[lvl] = levels.get(lvl, 0) + 1
            print("Levels:", levels)
            # Print structure of first story
            if data:
                first_key = list(data.keys())[0]
                first_story = data[first_key]
                print(f"First story ID: {first_key}")
                print(f"Keys: {list(first_story.keys())}")
                if "category" in first_story:
                    print(f"Category: {first_story['category']}")
                elif "genre" in first_story:
                    print(f"Genre: {first_story['genre']}")
    else:
        print(f"\nFile not found: {f_name}")
