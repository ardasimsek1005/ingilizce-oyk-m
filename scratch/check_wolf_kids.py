import json

with open("expanded_stories_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

story = data["wolf_kids"]
print("EN length:", len(story["en"]))
print("TR length:", len(story["tr"]))
print("EN paragraphs:")
for idx, p in enumerate(story["en"]):
    print(f"[{idx}] {p[:80]}...")
