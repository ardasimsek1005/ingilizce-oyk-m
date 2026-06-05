import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
workspace_dir = r"c:\Users\acer\antigravity\i̇ngilizce-öyküm"

avatar_files = []
for root, dirs, files in os.walk(workspace_dir):
    # Skip node_modules, .git, and dist
    if any(p in root for p in ["node_modules", ".git", "dist", "node-portable"]):
        continue
    for f in files:
        if "avatar" in f.lower():
            avatar_files.append(os.path.join(root, f))

print(f"Found {len(avatar_files)} avatar files in workspace:")
for f in sorted(avatar_files):
    print(f)
