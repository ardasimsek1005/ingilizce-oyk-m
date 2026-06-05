import os
import json
from PIL import Image

artifact_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"
public_covers_dir = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\public\covers"
stories_json_path = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\daily_stories_data.json"

os.makedirs(public_covers_dir, exist_ok=True)

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

# Load stories data
if not os.path.exists(stories_json_path):
    print("Error: daily_stories_data.json not found!")
    exit(1)

with open(stories_json_path, "r", encoding="utf-8") as f:
    stories_data = json.load(f)

# Find all generated files in artifacts
files_in_artifacts = os.listdir(artifact_dir)

updated_count = 0
processed_count = 0

for s_id, story in stories_data.items():
    prefix = f"{s_id}_cover"
    
    # Find matching file in artifacts
    match_file = None
    for f in files_in_artifacts:
        if f.startswith(prefix) and f.endswith(".png"):
            match_file = f
            break
            
    if match_file:
        src_path = os.path.join(artifact_dir, match_file)
        dest_path = os.path.join(public_covers_dir, f"{s_id}.webp")
        
        try:
            with Image.open(src_path) as img:
                img_sq = crop_to_square(img)
                img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
                img_resized.save(dest_path, "WEBP", quality=80)
                processed_count += 1
                
                # Update JSON cover URL if it's still generic
                expected_url = f"/covers/{s_id}.webp"
                if story["coverUrl"] != expected_url:
                    story["coverUrl"] = expected_url
                    updated_count += 1
                    
        except Exception as e:
            print(f"Error processing {s_id}: {e}")
    else:
        # Check if the WebP already exists (meaning it was processed earlier)
        dest_path = os.path.join(public_covers_dir, f"{s_id}.webp")
        if os.path.exists(dest_path):
            expected_url = f"/covers/{s_id}.webp"
            if story["coverUrl"] != expected_url:
                story["coverUrl"] = expected_url
                updated_count += 1

# Save updated stories data
if updated_count > 0:
    with open(stories_json_path, "w", encoding="utf-8") as f:
        json.dump(stories_data, f, indent=2, ensure_ascii=False)
    print(f"Updated {updated_count} stories' coverUrls in JSON.")

print(f"Covers processing finished. Processed {processed_count} files.")
