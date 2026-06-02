import re
import os

files_to_check = [
    r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602\src\stories_part1.ts",
    r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602\src\stories_part2.ts"
]

all_ids = []
for p in files_to_check:
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()
            ids = re.findall(r"id:\s*'([^']+)'", content)
            print(f"File: {os.path.basename(p)}")
            print(f"  Stories ({len(ids)}): {sorted(ids)}")
            all_ids.extend(ids)
    else:
        print(f"File not found: {p}")

print(f"\nTotal stories in backup: {len(all_ids)}")
