import os
import sys
import io
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

main_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"
target_dir = r"c:\Users\acer\antigravity\i̇ngilizce-öyküm\public\avatars"
os.makedirs(target_dir, exist_ok=True)

AVATARS_MAP = {
    "avatar_cat_reading": 11,
    "avatar_dog_reading": 12,
    "avatar_rabbit_reading": 13,
    "avatar_squirrel_reading": 14,
    "avatar_monkey_reading": 15,
    "avatar_koala_reading": 16,
    "avatar_alien_reading": 17,
    "avatar_fox_reading": 18,
    "avatar_tiger_reading": 19,
    "avatar_lion_reading": 20,
    "avatar_wizard_reading": 21,
    "avatar_astronaut_reading": 22,
    "avatar_dino_reading": 23,
    "avatar_frog_reading": 24,
    "avatar_elephant_reading": 25
}

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

files_in_artifacts = os.listdir(main_dir)

success_count = 0
for prefix, num in AVATARS_MAP.items():
    match_file = None
    for f in files_in_artifacts:
        if f.startswith(prefix) and f.endswith(".png"):
            match_file = f
            break
            
    if not match_file:
        print(f"Warning: File starting with '{prefix}' not found!")
        continue
        
    src_path = os.path.join(main_dir, match_file)
    dest_path = os.path.join(target_dir, f"avatar_{num}.webp")
    
    try:
        with Image.open(src_path) as img:
            img_sq = crop_to_square(img)
            img_resized = img_sq.resize((150, 150), Image.Resampling.LANCZOS)
            img_resized.save(dest_path, "WEBP", quality=75)
            print(f"Processed avatar_{num} ({prefix}) successfully")
            success_count += 1
    except Exception as e:
        print(f"Error processing {prefix}: {e}")

print(f"\nFinished processing {success_count}/15 avatars.")
