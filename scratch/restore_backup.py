import shutil
import os

backup_dir = r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602"
project_dir = r"c:\Users\acer\antigravity\i̇ngilizce-öyküm"

files_to_restore = [
    ("src/stories_part1.ts", "src/stories_part1.ts"),
    ("src/stories_part2.ts", "src/stories_part2.ts"),
    ("expanded_stories_data.json", "expanded_stories_data.json")
]

print("Restoring files from backup...")
for rel_b, rel_p in files_to_restore:
    b_path = os.path.join(backup_dir, rel_b)
    p_path = os.path.join(project_dir, rel_p)
    if os.path.exists(b_path):
        shutil.copy(b_path, p_path)
        print(f"  Restored {rel_p}")
    else:
        print(f"  Backup not found: {b_path}")

print("Restore completed successfully!")
