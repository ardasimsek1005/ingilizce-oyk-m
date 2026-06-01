import os
import urllib.request
import re
from PIL import Image

artifact_dir = r"C:\Users\acer\.gemini\antigravity\brain\89e50793-c6a0-447c-a6bb-d186dcde31e4"
public_covers_dir = r"C:\Users\acer\antigravity\i̇ngilizce-öyküm\public\covers"
scratch_covers_dir = r"C:\Users\acer\.gemini\antigravity\scratch\stories\covers"

# Ensure dirs exist
os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

# Predefined Unsplash mappings for fallback covers (disabled since all covers are custom generated!)
UNSPLASH_MAPPINGS = {}

# 29 generated PNG files mapping (mapping prefix to story ID)
GENERATED_MAP = {
    "pinocchio_cover": "pinocchio",
    "little_mermaid_cover": "little_mermaid",
    "princess_pea_cover": "princess_pea",
    "thumbelina_cover": "thumbelina",
    "robin_hood_cover": "robin_hood",
    "alice_wonderland_cover": "alice_wonderland",
    "boy_cried_wolf_cover": "boy_cried_wolf",
    "fox_grapes_cover": "fox_grapes",
    "ali_baba_cover": "ali_baba",
    "beauty_beast_cover": "beauty_beast",
    "aladdin_cover": "aladdin",
    "peter_pan_cover": "peter_pan",
    "sinbad_cover": "sinbad",
    "king_midas_cover": "king_midas",
    "wizard_of_oz_cover": "wizard_of_oz",
    "golden_goose_cover": "golden_goose",
    "pied_piper_cover": "pied_piper",
    "rumpelstiltskin_cover": "rumpelstiltskin",
    "gullivers_travels_cover": "gullivers_travels",
    "robinson_crusoe_cover": "robinson_crusoe",
    "gatsby_b2_cover": "gatsby_b2",
    "treasure_island_cover": "treasure_island",
    "frankenstein_cover": "frankenstein",
    "dracula_cover": "dracula",
    "sherlock_holmes_cover": "sherlock_holmes",
    "odyssey_cover": "odyssey",
    "jungle_book_cover": "jungle_book",
    "snow_queen_cover": "snow_queen",
    "normal_people_c1_cover": "normal_people_c1",
    "goldilocks_cover": "goldilocks",
    "puss_in_boots_cover": "puss_in_boots",
    
    # 16 new stories
    "elves_shoemaker_cover": "elves_shoemaker",
    "emperors_clothes_cover": "emperors_clothes",
    "happy_prince_cover": "happy_prince",
    "wind_willows_cover": "wind_willows",
    "secret_garden_cover": "secret_garden",
    "heidi_cover": "heidi",
    "little_prince_cover": "little_prince",
    "christmas_carol_cover": "christmas_carol",
    "around_world_cover": "around_world",
    "time_machine_cover": "time_machine",
    "white_fang_cover": "white_fang",
    "call_wild_cover": "call_wild",
    "don_quixote_cover": "don_quixote",
    "moby_dick_cover": "moby_dick",
    "hunchback_notredame_cover": "hunchback_notredame",
    "dorian_gray_cover": "dorian_gray"
}

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

def process_and_save(img_path, s_id):
    try:
        with Image.open(img_path) as img:
            # Crop to square
            img_sq = crop_to_square(img)
            # Resize for performance/quality balance
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            # Save WebP to public/covers (Production app)
            webp_pub_path = os.path.join(public_covers_dir, f"{s_id}.webp")
            img_resized.save(webp_pub_path, "WEBP", quality=80)
            
            # Save PNG to scratch/stories/covers (User request)
            png_scr_path = os.path.join(scratch_covers_dir, f"{s_id}.png")
            img_resized.save(png_scr_path, "PNG")
            
            print(f"Processed {s_id}: successfully saved WebP and PNG.")
            return True
    except Exception as e:
        print(f"Error processing {s_id}: {e}")
        return False

# 1. Process generated images from artifact folder
print("Searching for generated covers in artifacts...")
files_in_artifacts = os.listdir(artifact_dir)
for prefix, s_id in GENERATED_MAP.items():
    # Find matching file (e.g. pinocchio_cover_1780239766452.png)
    match_file = None
    for f in files_in_artifacts:
        if f.startswith(prefix) and f.endswith(".png"):
            match_file = f
            break
            
    if match_file:
        full_p = os.path.join(artifact_dir, match_file)
        print(f"Found generated cover for {s_id}: {match_file}")
        process_and_save(full_p, s_id)
    else:
        print(f"Warning: Generated cover file not found for prefix '{prefix}'!")

# 2. Download and process Unsplash fallback covers
print("\nDownloading and processing fallback covers...")
for s_id, url in UNSPLASH_MAPPINGS.items():
    print(f"Downloading cover for {s_id} from Unsplash...")
    temp_download_path = f"temp_{s_id}.jpg"
    try:
        urllib.request.urlretrieve(url, temp_download_path)
        process_and_save(temp_download_path, s_id)
        # Delete temp file
        if os.path.exists(temp_download_path):
            os.remove(temp_download_path)
    except Exception as e:
        print(f"Failed to download/process fallback for {s_id}: {e}")
        if os.path.exists(temp_download_path):
            os.remove(temp_download_path)

print("\nCover images optimization completed!")
