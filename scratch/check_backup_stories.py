import json
import os

files_to_check = [
    r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602\expanded_stories_data.json",
    r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602\horror_stories_data.json",
    r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602\classics_stories_data.json"
]

checked_ids = ["cinderella", "red_riding_hood", "jack_beanstalk", "ugly_duckling", "puss_in_boots", "hansel_gretel", "rapunzel", "sleeping_beauty", "goldilocks", "snowman"]

for f_path in files_to_check:
    if os.path.exists(f_path):
        with open(f_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            found = [s_id for s_id in checked_ids if s_id in data]
            print(f"File: {os.path.basename(f_path)}")
            print(f"  Found in backup: {found}")
    else:
        print(f"File not found in backup: {f_path}")
