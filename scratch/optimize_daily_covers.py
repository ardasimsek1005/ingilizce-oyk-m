import os
from PIL import Image

artifact_dir = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2"
public_covers_dir = r"C:\Users\acer\antigravity\i\u0307ngilizce-o\u0308yku\u0308m\public\covers"
# Note: Handle Windows Turkish characters gracefully or use normalized paths
public_covers_dir = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\public\covers"

os.makedirs(public_covers_dir, exist_ok=True)

# Files mapping
FILES_MAP = {
    "daily_a1_cover_1780585815290.png": "daily_a1",
    "daily_a2_cover_1780585830711.png": "daily_a2",
    "daily_b1_cover_1780585844192.png": "daily_b1",
    "daily_b2_cover_1780585858458.png": "daily_b2",
    "daily_c1_cover_1780585874790.png": "daily_c1"
}

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

for filename, target_name in FILES_MAP.items():
    src_path = os.path.join(artifact_dir, filename)
    if not os.path.exists(src_path):
        print(f"Source file not found: {src_path}")
        continue
    
    try:
        with Image.open(src_path) as img:
            img_sq = crop_to_square(img)
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            dest_path = os.path.join(public_covers_dir, f"{target_name}.webp")
            img_resized.save(dest_path, "WEBP", quality=80)
            print(f"Successfully optimized and saved cover for {target_name}")
    except Exception as e:
        print(f"Error processing {target_name}: {e}")

print("Covers optimization completed!")
