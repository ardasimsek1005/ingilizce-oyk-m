import os
import re
import subprocess
import sys

brain_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"

# Prefixes of generated images
prefixes = [
    "peter_wolf_cover",
    "tin_soldier_cover",
    "magic_pot_cover",
    "wolf_kids_cover",
    "brave_tailor_cover",
    "selfish_giant_cover",
    "nightingale_cover",
    "tinderbox_cover",
    "wild_swans_cover",
    "goose_girl_cover"
]

print("Cleaning up old duplicate generated covers in brain directory...")
files_in_brain = os.listdir(brain_dir)
for prefix in prefixes:
    matches = [f for f in files_in_brain if f.startswith(prefix) and f.endswith(".png")]
    if len(matches) > 1:
        # Sort by timestamp (the number after the prefix)
        def get_timestamp(fn):
            match = re.search(r'_(\d+)\.png$', fn)
            return int(match.group(1)) if match else 0
        
        matches.sort(key=get_timestamp)
        latest_file = matches[-1]
        print(f"For {prefix}, keeping latest: {latest_file}")
        
        for f in matches[:-1]:
            fp = os.path.join(brain_dir, f)
            os.remove(fp)
            print(f"  Removed older version: {f}")
    elif len(matches) == 1:
        print(f"For {prefix}, only one file found: {matches[0]} (kept)")
    else:
        print(f"Warning: No files found for {prefix}")

# Prepend portable node to PATH for subprocesses
env = os.environ.copy()
portable_node = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\node-portable"
env["PATH"] = f"{portable_node};" + env.get("PATH", "")

# 2. Run cover optimization script again
print("\nRunning cover optimization script...")
p1 = subprocess.run("python download_and_optimize_covers.py", shell=True, env=env)
if p1.returncode != 0:
    print("Cover optimization failed!")
    sys.exit(1)

# 3. Build project
print("\nRunning npm run build...")
p2 = subprocess.run("npm.cmd run build", shell=True, env=env)
if p2.returncode != 0:
    print("Build failed!")
    sys.exit(1)

# 4. Sync capacitor
print("\nRunning npx cap sync android...")
p3 = subprocess.run("npx.cmd cap sync android", shell=True, env=env)
if p3.returncode != 0:
    print("Capacitor sync failed!")
    sys.exit(1)

print("\nCleanup and run completed successfully!")
