import subprocess
import os
import sys

def run_script(cmd, desc):
    print(f"\n==========================================")
    print(f"STARTING: {desc}")
    print(f"COMMAND: {cmd}")
    print(f"==========================================")
    
    # Prepend portable node to path for build tools
    env = os.environ.copy()
    portable_node = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\node-portable"
    env["PATH"] = f"{portable_node};" + env.get("PATH", "")
    
    try:
        process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env
        )
        
        # Stream output in real time
        for line in process.stdout:
            try:
                sys.stdout.write(line)
                sys.stdout.flush()
            except UnicodeEncodeError:
                encoding = sys.stdout.encoding or "ascii"
                safe_line = line.encode(encoding, errors="replace").decode(encoding)
                sys.stdout.write(safe_line)
                sys.stdout.flush()
            
        process.wait()
        
        if process.returncode == 0:
            print(f"SUCCESS: {desc} completed successfully.")
            return True
        else:
            print(f"FAILURE: {desc} failed with exit code {process.returncode}.")
            return False
    except Exception as e:
        print(f"EXCEPTION: {desc} encountered error: {e}")
        return False

# Step 1: Run Story Generator
success = run_script("python scratch/generate_10_fairy_tales.py", "Fairy Tales & Children Story Generation (A1 & B1)")
if not success:
    print("Aborting pipeline at Step 1.")
    sys.exit(1)

# Step 2: Run Word Scanner & Auto-Translator
success = run_script("python scratch/scan_and_correct_words.py", "Scanning & Fixing Word Translation Mismatches")
if not success:
    print("Aborting pipeline at Step 2.")
    sys.exit(1)

# Step 3: Compile stories into TypeScript bundle
success = run_script("python compile_stories.py", "Compiling Story Databases into src/stories_part*.ts")
if not success:
    print("Aborting pipeline at Step 3.")
    sys.exit(1)

# Step 4: Run Vite build to verify bundle
success = run_script("npm.cmd run build", "Vite production compilation check")
if not success:
    print("Aborting pipeline at Step 4.")
    sys.exit(1)

# Step 5: Sync changes to Android Studio
success = run_script("npx.cmd cap sync android", "Capacitor Sync to Android Studio")
if not success:
    print("Aborting pipeline at Step 5.")
    sys.exit(1)

print("\n==========================================")
print("ALL BACKGROUND TASKS COMPLETED SUCCESSFULLY!")
print("==========================================")
