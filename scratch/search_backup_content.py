import os

backup_dir = r"c:\Users\acer\antigravity\ingilizce_oykum_backup_20260602"
found_files = []

for root, dirs, files in os.walk(backup_dir):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.json', '.js', '.txt')):
            p = os.path.join(root, f)
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as file:
                    if "cinderella" in file.read().lower():
                        found_files.append(p)
            except:
                pass

print(f"Files referencing 'cinderella' in backup:")
for f in found_files:
    print(f"  - {f}")
