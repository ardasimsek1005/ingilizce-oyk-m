import json
import os
import sys

transcript_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"
out_path = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\scratch\all_book_cover_prompts.txt"

prompts_found = []
if os.path.exists(transcript_path):
    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line)
                if "tool_calls" in data:
                    for tc in data["tool_calls"]:
                        if tc.get("name") == "generate_image":
                            args = tc.get("args", {})
                            img_name = args.get("ImageName", "")
                            prompt = args.get("Prompt", "")
                            if img_name.startswith('"') and img_name.endswith('"'):
                                img_name = img_name[1:-1]
                            if prompt.startswith('"') and prompt.endswith('"'):
                                prompt = prompt[1:-1]
                            
                            if "cover" in img_name.lower():
                                prompts_found.append(f"ImageName: {img_name}\nPrompt: {prompt}\n" + "-"*40 + "\n")
            except Exception as e:
                pass

with open(out_path, "w", encoding="utf-8") as out:
    out.writelines(prompts_found)

# Safe console printing
encoding = sys.stdout.encoding or "utf-8"
msg = f"Done. Found {len(prompts_found)} cover prompts. Saved to all_book_cover_prompts.txt"
safe_msg = msg.encode(encoding, errors="replace").decode(encoding)
print(safe_msg)
