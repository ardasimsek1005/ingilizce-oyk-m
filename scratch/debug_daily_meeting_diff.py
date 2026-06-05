import json
import re

with open("daily_stories_data.json", "r", encoding="utf-8") as f:
    json_data = json.load(f)

json_p = json_data["daily_meeting"]["en"][0]

with open("src/stories_part2.ts", "r", encoding="utf-8") as f:
    ts_content = f.read()

pattern = r"id:\s*'daily_meeting',.*?en:\s*\[(.*?)\]"
match = re.search(pattern, ts_content, re.DOTALL)
if match:
    ts_block = match.group(1)
    ts_p = re.findall(r'"([^"]+)"', ts_block)[0]
    print(f"JSON: {repr(json_p[:80])}")
    print(f"TS:   {repr(ts_p[:80])}")
    if json_p == ts_p:
        print("Identical!")
    else:
        # Check diff
        print("Diff index by char:")
        for idx, (c1, c2) in enumerate(zip(json_p, ts_p)):
            if c1 != c2:
                print(f"Diff at {idx}: json={repr(c1)}, ts={repr(c2)}")
                break
