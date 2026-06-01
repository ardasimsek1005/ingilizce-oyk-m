import json
import os

DATA_FILE = "expanded_stories_data.json"
part2_path = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\src\stories_part2.ts"

if not os.path.exists(DATA_FILE):
    print("Stories data file not found!")
    exit(1)

with open(DATA_FILE, "r", encoding="utf-8") as f:
    expanded_stories = json.load(f)

print(f"Loaded {len(expanded_stories)} expanded stories from JSON.")

def format_ts_story(story):
    # Escape quotes in strings
    def esc(s):
        return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')

    en_lines = ",\n      ".join(f'"{esc(p)}"' for p in story["en"])
    tr_lines = ",\n      ".join(f'"{esc(p)}"' for p in story["tr"])
    
    words_lines = ",\n      ".join(f'"{esc(k)}": "{esc(v)}"' for k, v in story["words"].items())
    
    return f"""  {{
    id: '{story["id"]}',
    title: "{esc(story["title"])}",
    author: '{esc(story["author"])}',
    level: '{story["level"]}',
    coverUrl: '{story["coverUrl"]}',
    en: [
      {en_lines}
    ],
    tr: [
      {tr_lines}
    ],
    words: {{
      {words_lines}
    }}
  }}"""

# Filter B1, B2, C1 stories
part2_stories = []
for s_id, story in expanded_stories.items():
    if story["level"] in ["B1", "B2", "C1"]:
        part2_stories.append(format_ts_story(story))

new_content = """import { RawStory } from './stories_part1';

export const STORIES_PART2: RawStory[] = [
""" + ",\n".join(part2_stories) + "\n];\n"

with open(part2_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print(f"Successfully generated {len(part2_stories)} stories into {part2_path}!")
