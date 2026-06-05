import subprocess
import os

env = os.environ.copy()
p = subprocess.run("git diff HEAD~1 -- src/components/ReadingView.tsx", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=env)
print("STDOUT:")
print(p.stdout)
print("STDERR:")
print(p.stderr)
