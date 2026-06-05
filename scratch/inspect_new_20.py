import json
import os

with open("new_20_stories.json", "r", encoding="utf-8") as f:
    new_20 = json.load(f)

print(f"new_20_stories.json has keys: {list(new_20.keys())}")

# Check if any of these are in stories_part1.ts or stories_part2.ts
for p in ["src/stories_part1.ts", "src/stories_part2.ts"]:
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
        found = [k for k in new_20.keys() if k in content]
        print(f"{p} contains these new_20 keys: {found}")
