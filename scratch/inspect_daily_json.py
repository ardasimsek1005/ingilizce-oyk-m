import json

with open("daily_stories_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total stories in daily_stories_data.json: {len(data)}")
a1_a2_stories = []
for story_id, story in data.items():
    level = story.get("level")
    if level in ["A1", "A2"]:
        a1_a2_stories.append((story_id, level))

print(f"A1/A2 stories ({len(a1_a2_stories)}):")
for s_id, lvl in a1_a2_stories:
    print(f" - {s_id}: {lvl}")
