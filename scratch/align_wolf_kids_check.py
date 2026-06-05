import json

with open("expanded_stories_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

story = data["wolf_kids"]
en_clean = [p for i, p in enumerate(story["en"]) if i not in [3, 4, 5]]
tr = story["tr"]

print(f"EN clean length: {len(en_clean)}, TR length: {len(tr)}")
for idx, (e, t) in enumerate(zip(en_clean, tr)):
    print(f"\n--- Paragraph {idx+1} ---")
    print("EN:", e[:100] + "...")
    print("TR:", t[:100] + "...")
