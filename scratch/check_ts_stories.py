import re
import os

part1_path = r"src\stories_part1.ts"
part2_path = r"src\stories_part2.ts"

def check_file(path):
    if not os.path.exists(path):
        print(f"{path} does not exist.")
        return []
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    ids = re.findall(r"id:\s*'([^']+)'", content)
    levels = re.findall(r"level:\s*'([^']+)'", content)
    print(f"{path}: found {len(ids)} stories. First 5: {ids[:5]}, Last 5: {ids[-5:]}")
    # Print any anomalies
    anomalies = []
    # parse stories block-by-block roughly
    blocks = re.findall(r"\{\s*id:\s*'([^']+)'.*?level:\s*'([^']+)'", content, re.DOTALL)
    return blocks

blocks1 = check_file(part1_path)
blocks2 = check_file(part2_path)

print(f"Total blocks in part1: {len(blocks1)}")
print(f"Total blocks in part2: {len(blocks2)}")

# Check if any A1/A2 are in part2, or B1/B2/C1 in part1
for s_id, lvl in blocks1:
    if lvl not in ["A1", "A2"]:
        print(f"Anomaly: {s_id} ({lvl}) is in part 1")
for s_id, lvl in blocks2:
    if lvl in ["A1", "A2"]:
        print(f"Anomaly: {s_id} ({lvl}) is in part 2")
