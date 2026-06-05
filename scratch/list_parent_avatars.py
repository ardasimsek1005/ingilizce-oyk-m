import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
parent_brain_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"
if os.path.exists(parent_brain_dir):
    files = [f for f in os.listdir(parent_brain_dir) if "avatar_" in f]
    print(f"Found {len(files)} avatar files in parent brain dir:")
    for f in sorted(files):
        print(f)
else:
    print("Parent brain dir does not exist.")
