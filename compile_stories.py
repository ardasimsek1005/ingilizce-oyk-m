import os
import json
import re

DATA_FILE = "expanded_stories_data.json"
part1_path = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\src\stories_part1.ts"
part2_path = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\src\stories_part2.ts"

expanded_stories = {}
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        expanded_stories = json.load(f)

HORROR_DATA_FILE = "horror_stories_data.json"
if os.path.exists(HORROR_DATA_FILE):
    with open(HORROR_DATA_FILE, "r", encoding="utf-8") as f:
        horror_stories = json.load(f)
        expanded_stories.update(horror_stories)
        print(f"Loaded {len(horror_stories)} horror stories.")

print(f"Loaded total of {len(expanded_stories)} expanded stories from JSON.")

def format_ts_story(story):
    # Escape quotes in strings
    def esc(s):
        return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')

    def clean_p(p):
        # Strip prefixes like "Chapter 1:", "Capture 2 -", "Bölüm 3:"
        pattern = r"^\s*(?:chapter|capture|bölüm|part|section)\s+(?:[0-9]+|[ivxldm]+)\b[:\-\s\.]*"
        cleaned = re.sub(pattern, "", p, flags=re.IGNORECASE).strip()
        # Handle standalone header lines
        if re.match(r"^\s*(?:chapter|capture|bölüm|part|section)\s*(?:[0-9]+|[ivxldm]+)?\s*$", cleaned, re.IGNORECASE):
            return ""
        return cleaned

    cleaned_en = [clean_p(p) for p in story["en"]]
    cleaned_en = [p for p in cleaned_en if p]

    cleaned_tr = [clean_p(p) for p in story["tr"]]
    cleaned_tr = [p for p in cleaned_tr if p]

    en_lines = ",\n      ".join(f'"{esc(p)}"' for p in cleaned_en)
    tr_lines = ",\n      ".join(f'"{esc(p)}"' for p in cleaned_tr)
    
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

# Process part 1 (A2 stories)
if os.path.exists(part1_path):
    with open(part1_path, "r", encoding="utf-8") as f:
        content1 = f.read()
        
    # We want to replace each story in STORIES_PART1
    for s_id, story in expanded_stories.items():
        if story["level"] in ["A1", "A2"]:
            # Search for the story object block with matching id: 's_id'
            pattern = r"\{\s*id:\s*'" + s_id + r"',.*?\}\s*(?=,\s*\{|\s*\])"
            formatted = format_ts_story(story)
            
            # Find and replace
            match = re.search(pattern, content1, re.DOTALL)
            if match:
                content1 = content1.replace(match.group(0), formatted)
                print(f"Replaced {s_id} in stories_part1.ts")
            else:
                if "];" in content1:
                    parts = content1.rsplit("];", 1)
                    content1 = parts[0] + ",\n" + formatted + "\n];" + parts[1]
                    print(f"Appended new story {s_id} to stories_part1.ts")
                else:
                    print(f"Warning: Story {s_id} not found and could not append to stories_part1.ts")
                
    with open(part1_path, "w", encoding="utf-8") as f:
        f.write(content1)

# Process part 2 (B1, B2, C1 stories)
if os.path.exists(part2_path):
    with open(part2_path, "r", encoding="utf-8") as f:
        content2 = f.read()
        
    # We want to replace each story in STORIES_PART2
    for s_id, story in expanded_stories.items():
        if story["level"] in ["B1", "B2", "C1"]:
            # Search for the story object block with matching id: 's_id'
            pattern = r"\{\s*id:\s*'" + s_id + r"',.*?\}\s*(?=,\s*\{|\s*\])"
            formatted = format_ts_story(story)
            
            # Update levels in database if changed (e.g. B2 to B1)
            # Find and replace
            match = re.search(pattern, content2, re.DOTALL)
            if match:
                content2 = content2.replace(match.group(0), formatted)
                print(f"Replaced {s_id} (Level {story['level']}) in stories_part2.ts")
            else:
                if "];" in content2:
                    parts = content2.rsplit("];", 1)
                    content2 = parts[0] + ",\n" + formatted + "\n];" + parts[1]
                    print(f"Appended new story {s_id} to stories_part2.ts")
                else:
                    print(f"Warning: Story {s_id} not found and could not append to stories_part2.ts")
                
    with open(part2_path, "w", encoding="utf-8") as f:
        f.write(content2)

print("Stories compilation completed!")
