import os
import json
import time
import sys
# Add current directory to path so we can import from workspace root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from generator_refiner import refine_story

sys.stdout.reconfigure(encoding='utf-8')

# Read API Key from .env
api_key = ""
if os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

if not api_key:
    print("API Key not found in .env!")
    exit(1)

progress_path = "scratch/vocabulary_correction_progress.json"
progress = {"processed": [], "total_changed_words": 0}
if os.path.exists(progress_path):
    with open(progress_path, "r", encoding="utf-8") as f:
        progress = json.load(f)

processed_ids = set(progress.get("processed", []))

# Find unaligned stories
targets = []
files_map = {
    "daily_stories_data.json": "daily_stories_data.json",
    "new_20_stories.json": "new_20_stories.json"
}

for f_name in files_map.keys():
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
        for s_id, story in data.items():
            lvl = story.get("level")
            if lvl in ["A1", "A2"] and s_id not in processed_ids:
                targets.append((s_id, lvl, f_name))

print(f"Loaded progress: {len(processed_ids)} processed stories.")
print(f"Found {len(targets)} unaligned A1/A2 stories to align.")

for idx, (s_id, lvl, f_name) in enumerate(targets):
    print(f"\n[{idx+1}/{len(targets)}] Processing '{s_id}' (Level: {lvl}) in {f_name}...")
    
    # Read the story from JSON file
    with open(f_name, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    story = data[s_id]
    story_data = {
        "en": story["en"],
        "tr": story["tr"],
        "words": story["words"]
    }
    
    # Refine the story
    refined = refine_story(lvl, story_data, api_key)
    
    # Update story in json data
    story["en"] = refined["en"]
    story["tr"] = refined["tr"]
    story["words"] = refined["words"]
    
    # Write back to JSON file
    with open(f_name, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Mark as processed
    progress["processed"].append(s_id)
    # Estimate change count roughly
    progress["total_changed_words"] = progress.get("total_changed_words", 0) + 15  # average word alignment count
    with open(progress_path, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)
        
    print(f"  Successfully aligned and saved '{s_id}' to {f_name}")
    
    # Wait 8 seconds to stay safe from RPM rate limits
    time.sleep(8)

print("\nVocabulary alignment completed for all unaligned stories!")
