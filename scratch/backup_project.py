import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

src = r"c:\Users\acer\antigravity\i\u0307ngilizce-ykm"
# Resolve the actual literal path of the source to avoid encoding glitches on Windows
src = os.path.abspath(r"c:\Users\acer\antigravity\i̇ngilizce-öyküm")
dst = r"c:\Users\acer\antigravity\Arsiv\versiyon-1.3"

print(f"Starting complete 1-to-1 backup from: {src}")
print(f"To destination: {dst}")

try:
    if os.path.exists(dst):
        print(f"Destination {dst} already exists. Removing it first...")
        shutil.rmtree(dst)
        
    shutil.copytree(src, dst)
    print("Complete backup completed successfully!")
except Exception as e:
    print(f"Error during backup: {e}")
    sys.exit(1)
