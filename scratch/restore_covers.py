import os
import shutil

backup_dir = r"C:\Users\acer\antigravity\ingilizce_oykum_backup_20260602\public\covers"
target_dir = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\public\covers"

files_to_restore = [
    'goldilocks.webp',
    'hansel_gretel.webp',
    'puss_in_boots.webp',
    'rapunzel.webp',
    'red_riding_hood.webp',
    'sleeping_beauty.webp',
    'ugly_duckling.webp'
]

print("Restoring covers from backup...")
for f in files_to_restore:
    src = os.path.join(backup_dir, f)
    dst = os.path.join(target_dir, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"  Restored {f} (Size: {os.path.getsize(dst)} bytes)")
    else:
        print(f"  Warning: {f} not found in backup!")

print("Restore completed.")
