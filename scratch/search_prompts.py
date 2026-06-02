import os

brain_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"

keywords = ["cover", "pixar", "3d", "generate", "image", "prompt"]

print("Searching brain directory files...")
for root, dirs, files in os.walk(brain_dir):
    if ".system_generated" in root or ".agents" in root:
        continue
    for f in files:
        if f.endswith(".md") or f.endswith(".json") or f.endswith(".py") or f.endswith(".txt"):
            fp = os.path.join(root, f)
            try:
                with open(fp, "r", encoding="utf-8", errors="ignore") as file:
                    content = file.read()
                    matches = [kw for kw in keywords if kw.lower() in content.lower()]
                    if matches:
                        print(f"\n--- Found in {f} (matched keywords: {matches}) ---")
                        # Print lines containing prompt or generate_image or pixar
                        lines = content.splitlines()
                        for i, line in enumerate(lines):
                            if any(kw in line.lower() for kw in ["pixar", "prompt", "generate_image", "style", "style_preset"]):
                                print(f"  Line {i+1}: {line.strip()[:150]}")
            except Exception as e:
                print(f"Error reading {f}: {e}")
