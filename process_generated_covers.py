import os
import glob
import re
from PIL import Image

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity\brain\10fee2c6-bb20-4f93-b938-314bd550cc65"
PUBLIC_COVERS_DIR = r"c:\Users\acer\antigravity\ingilizce-oykum\public\covers"
SCRATCH_COVERS_DIR = r"c:\Users\acer\antigravity\ingilizce-oykum\scratch\history\covers"

os.makedirs(PUBLIC_COVERS_DIR, exist_ok=True)
os.makedirs(SCRATCH_COVERS_DIR, exist_ok=True)

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

def process_image(src_path, story_id):
    try:
        # Determine category folder in scratch
        category = "history"
        if story_id.startswith("mythology_"):
            category = "mythology"
        elif story_id.startswith("travel_culture_"):
            category = "travel_culture"
        elif story_id.startswith("nature_space_"):
            category = "nature_space"
            
        scratch_dir = os.path.join(r"c:\Users\acer\antigravity\ingilizce-oykum\scratch", category, "covers")
        os.makedirs(scratch_dir, exist_ok=True)
        
        with Image.open(src_path) as img:
            img_sq = crop_to_square(img)
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            # Save WebP to public/covers
            webp_path = os.path.join(PUBLIC_COVERS_DIR, f"{story_id}.webp")
            img_resized.save(webp_path, "WEBP", quality=85)
            
            # Save PNG to scratch/category/covers
            png_path = os.path.join(scratch_dir, f"{story_id}.png")
            img_resized.save(png_path, "PNG")
            
        print(f"Successfully processed {story_id} from {os.path.basename(src_path)}")
        return True
    except Exception as e:
        print(f"Error processing {src_path}: {e}")
        return False

def main():
    print("Scanning artifacts directory for generated covers...")
    # Find all PNG files in artifacts directory
    png_files = glob.glob(os.path.join(ARTIFACTS_DIR, "*.png"))
    
    # Sort files so that newer files are processed if there are duplicates
    png_files.sort(key=os.path.getmtime)
    
    processed_count = 0
    prefixes = ["history_", "mythology_", "travel_culture_", "nature_space_"]
    
    for file_path in png_files:
        filename = os.path.basename(file_path)
        
        # Check if filename starts with any of our known prefixes
        matching_prefix = None
        for pref in prefixes:
            if filename.startswith(pref):
                matching_prefix = pref
                break
                
        if matching_prefix:
            # Match pattern: prefix_[name]_[digits].png or prefix_[name].png
            pattern = rf"^({matching_prefix}[a-zA-Z0-9_]+?)(?:_\d+)?\.png$"
            match = re.match(pattern, filename)
            if match:
                story_id = match.group(1)
                
                # Check if we already have the webp file and it's not empty
                webp_path = os.path.join(PUBLIC_COVERS_DIR, f"{story_id}.webp")
                if os.path.exists(webp_path) and os.path.getsize(webp_path) > 0:
                    continue
                
                print(f"Found new cover artifact for {story_id}: {filename}")
                if process_image(file_path, story_id):
                    processed_count += 1
            else:
                print(f"Skipping file with unrecognized pattern: {filename}")
                
    print(f"Processing complete. Processed {processed_count} new cover images.")

if __name__ == "__main__":
    main()

