import subprocess
import sys
import os
import json
import time

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

log_file_path = "scratch/expansion_progress_log.txt"
os.makedirs("scratch", exist_ok=True)

def log(msg):
    timestamp = time.strftime("[%Y-%m-%d %H:%M:%S]")
    line = f"{timestamp} {msg}\n"
    print(line.strip(), flush=True)
    with open(log_file_path, "a", encoding="utf-8") as f:
        f.write(line)

log("Starting 180 Stories Expansion Pipeline...")

def run_script(script_name):
    log(f"--- Running {script_name} ---")
    proc = subprocess.Popen(
        [sys.executable, script_name],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8"
    )
    
    # Read output line by line as it is generated
    while True:
        line = proc.stdout.readline()
        if not line and proc.poll() is not None:
            break
        if line:
            log(f"[{script_name}] {line.strip()}")
            
    rc = proc.poll()
    if rc == 0:
        log(f"--- Completed {script_name} successfully (Exit code: 0) ---")
    else:
        log(f"--- {script_name} FAILED (Exit code: {rc}) ---")
    return rc == 0

# Run scripts one by one
success = True
for script in ["generate_mythology_stories.py", "generate_travel_stories.py", "generate_nature_stories.py"]:
    if not run_script(script):
        success = False
        log(f"Aborting pipeline due to failure in {script}")
        break

if success:
    log("All 3 story databases generated successfully!")
else:
    log("Pipeline finished with errors.")
    sys.exit(1)
