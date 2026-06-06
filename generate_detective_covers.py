import os
import urllib.request
import urllib.parse
import time
from PIL import Image

public_covers_dir = r"C:\Users\acer\antigravity\ingilizce-oykum\public\covers"
scratch_covers_dir = r"C:\Users\acer\antigravity\ingilizce-oykum\scratch\detective\covers"

# Ensure dirs exist
os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

# 50 Unsplash image keywords for Detective covers
KEYWORD_MAPPINGS = {
    "detective_scandal_bohemia": "sherlock-holmes-scandal-letter",
    "detective_copper_beeches": "creepy-country-house-forest",
    "detective_blue_cross": "catholic-priest-london-street",
    "detective_queens_necklace": "antique-diamond-necklace",
    "detective_coin_dionysius": "ancient-greek-silver-coin",
    "detective_dancing_men": "stick-figures-secret-code",
    "detective_red_silk_scarf": "red-silk-scarf-mystery",
    "detective_queer_feet": "luxury-hotel-dining-hall",
    "detective_lenton_croft": "english-manor-house-night",
    "detective_cell_13_part1": "locked-prison-cell-door",
    
    "detective_study_scarlet_1": "victorian-empty-room-candle",
    "detective_study_scarlet_2": "rocky-mountain-carriage-desert",
    "detective_sign_four_1": "london-street-lamp-fog-pearl",
    "detective_sign_four_2": "river-boat-chase-night",
    "detective_silver_blaze": "racehorse-stables-moorland",
    "detective_arrest_lupin": "vintage-passenger-steamship",
    "detective_lupin_in_prison": "stone-jail-cell-window",
    "detective_escape_lupin": "vintage-courtroom-judge",
    "detective_mysterious_passenger": "steam-train-carriage-interior",
    "detective_flying_stars": "diamond-shining-night-snow",
    "detective_sins_saradine": "mysterious-island-house-river",
    "detective_biter_bit": "cluttered-detective-desk-magnifying",
    "detective_fenchurch_street": "steam-railway-station-platform",
    "detective_cell_13_part2": "bent-prison-window-bars",
    "detective_marie_roget": "seine-river-paris-dusk",
    
    "detective_hound_baskervilles_1": "scary-foggy-moorland-night",
    "detective_hound_baskervilles_2": "glowing-beast-hound-fog",
    "detective_valley_fear_1": "moat-castle-bridge-night",
    "detective_valley_fear_2": "old-coal-mine-workers",
    "detective_musgrave_ritual": "stone-cellar-old-iron-chest",
    "detective_final_problem": "huge-reichenbach-waterfall-cliffs",
    "detective_empty_house": "wax-bust-shadow-window",
    "detective_invisible_man": "london-street-snow-footprints",
    "detective_hammer_of_god": "gothic-church-spire-clouds",
    "detective_moonstone_1": "large-yellow-diamond-gem",
    "detective_moonstone_2": "dark-victorian-bedroom-moonlight",
    "detective_circular_staircase_1": "gothic-spiral-staircase-shadow",
    "detective_phantom_motor": "vintage-car-headlights-night-road",
    
    "detective_woman_in_white_1": "woman-white-dress-foggy-road",
    "detective_woman_in_white_2": "gothic-asylum-building-dusk",
    "detective_yellow_room_1": "mysterious-yellow-room-interior",
    "detective_yellow_room_2": "old-french-chateau-hallway",
    "detective_lady_in_black": "vintage-perfume-bottle-lace",
    "detective_holmes_too_late": "castle-tower-ruins-moonlight",
    "detective_laker_absconded": "vintage-leather-money-bag",
    "detective_dublin_mystery": "old-library-lawyer-office",
    "detective_crystal_gazer": "glowing-crystal-ball-mystic",
    
    "detective_moonstone_revelation": "victorian-drawing-room-fireplace",
    "detective_double_life": "mysterious-man-fedora-shadow",
    "detective_gold_bug_1": "antique-pirate-treasure-map"
}

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

def download_and_process(s_id, keyword):
    # Search unsplash for high quality mystery illustrations
    query = urllib.parse.quote(keyword.replace("-", " ") + " mystery")
    search_url = f"https://source.unsplash.com/featured/500x500/?{query}"
    
    temp_path = f"temp_{s_id}.jpg"
    try:
        req = urllib.request.Request(
            search_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            with open(temp_path, "wb") as f:
                f.write(response.read())
    except Exception as e:
        print(f"  Unsplash source failed for {s_id}: {e}. Downloading curated abstract...")
        try:
            req = urllib.request.Request(
                "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80", # Curated dark mystery photo
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req, timeout=20) as response:
                with open(temp_path, "wb") as f:
                    f.write(response.read())
        except Exception as fallback_err:
            print(f"  Curated abstract failed too: {fallback_err}")
            return False

    try:
        with Image.open(temp_path) as img:
            img_sq = crop_to_square(img)
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            # Save WebP to public/covers
            webp_path = os.path.join(public_covers_dir, f"{s_id}.webp")
            img_resized.save(webp_path, "WEBP", quality=80)
            
            # Save PNG to scratch/detective/covers
            png_path = os.path.join(scratch_covers_dir, f"{s_id}.png")
            img_resized.save(png_path, "PNG")
            
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"  Success: Generated cover for {s_id}")
        return True
    except Exception as e:
        print(f"  Error processing cover for {s_id}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False

print(f"Downloading and optimizing {len(KEYWORD_MAPPINGS)} Detective covers...")
for idx, (s_id, keyword) in enumerate(KEYWORD_MAPPINGS.items()):
    webp_path = os.path.join(public_covers_dir, f"{s_id}.webp")
    if os.path.exists(webp_path):
        print(f"[{idx+1}/{len(KEYWORD_MAPPINGS)}] Cover for {s_id} already exists. Skipping.")
        continue
        
    print(f"[{idx+1}/{len(KEYWORD_MAPPINGS)}] Downloading cover for {s_id} (Keyword: {keyword})...")
    download_and_process(s_id, keyword)
    time.sleep(1) # Polite pause

print("Detective covers generation completed!")
