import os
import urllib.request
import urllib.parse
import time
from PIL import Image

public_covers_dir = r"C:\Users\acer\antigravity\ingilizce-oykum\public\covers"
scratch_covers_dir = r"C:\Users\acer\antigravity\ingilizce-oykum\scratch\history\covers"

# Ensure dirs exist
os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

# 50 Unsplash image keywords for History covers
KEYWORD_MAPPINGS = {
    "history_giza_pyramids": "giza-pyramids-egypt",
    "history_great_wall": "great-wall-china",
    "history_roman_colosseum": "colosseum-rome",
    "history_marco_polo": "marco-polo-camel-desert",
    "history_discovery_fire": "prehistoric-cavemen-campfire",
    "history_troy_legend": "trojan-horse-ancient-greece",
    "history_pompeii": "pompeii-volcano-eruption-ruins",
    "history_paper_invention": "ancient-chinese-scroll-papyrus",
    "history_viking_voyagers": "viking-ship-ocean-storm",
    "history_first_marathon": "ancient-greek-runner-marathon",
    
    "history_alexander_great": "alexander-great-horse-battle",
    "history_julius_caesar": "julius-caesar-senate-rome",
    "history_cleopatra": "cleopatra-queen-egypt",
    "history_joan_of_arc": "joan-of-arc-armor-flag",
    "history_christopher_columbus": "christopher-columbus-ship-ocean",
    "history_leonardo_da_vinci": "leonardo-da-vinci-mona-lisa-drawing",
    "history_gutenberg_press": "gutenberg-printing-press-bible",
    "history_taj_mahal": "taj-mahal-india",
    "history_robin_hood": "robin-hood-archer-forest",
    "history_boston_tea_party": "boston-tea-party-ships",
    "history_magna_carta": "magna-carta-king-seal",
    "history_wright_brothers": "wright-brothers-first-flight",
    "history_galileo_galilei": "galileo-telescope-stars",
    "history_king_arthur": "king-arthur-excalibur-sword-stone",
    "history_silk_road": "silk-road-caravan-camel",
    
    "history_fall_constantinople": "constantinople-siege-walls-ships",
    "history_french_revolution": "french-revolution-bastille",
    "history_isaac_newton": "isaac-newton-apple-gravity",
    "history_industrial_revolution": "steam-engine-factory-smoke",
    "history_gettysburg_address": "abraham-lincoln-speech-crowd",
    "history_eiffel_tower": "building-eiffel-tower-paris",
    "history_sinking_titanic": "titanic-sinking-iceberg-night",
    "history_tutankhamun_tomb": "tutankhamun-golden-mask-tomb",
    "history_albert_einstein": "albert-einstein-chalkboard-physics",
    "history_apollo_11": "apollo-11-moon-landing-astronaut",
    "history_marie_curie": "marie-curie-laboratory-radium",
    "history_great_fire_london": "great-fire-london-burning",
    "history_rosetta_stone": "rosetta-stone-hieroglyphs",
    
    "history_renaissance_florence": "florence-italy-renaissance",
    "history_enlightenment": "french-salon-philosophers-enlightenment",
    "history_berlin_wall": "berlin-wall-fall-people",
    "history_penicillin_discovery": "penicillin-mold-petri-dish",
    "history_declaration_independence": "signing-declaration-independence",
    "history_code_hammurabi": "code-hammurabi-stone-tablet",
    "history_american_civil_war": "american-civil-war-battle",
    "history_printing_revolution": "movable-type-printing-letters",
    "history_black_death": "plague-doctor-mask-middle-ages",
    
    "history_roman_empire": "roman-legion-soldiers-marching",
    "history_library_alexandria": "library-alexandria-burning-scrolls",
    "history_history_writing": "ancient-clay-tablet-cuneiform"
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
    # Search unsplash for high quality history illustrations
    query = urllib.parse.quote(keyword.replace("-", " ") + " history")
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
                "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80", # Curated history/clock photo
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
            
            # Save PNG to scratch/history/covers
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

print(f"Downloading and optimizing {len(KEYWORD_MAPPINGS)} History covers...")
for idx, (s_id, keyword) in enumerate(KEYWORD_MAPPINGS.items()):
    webp_path = os.path.join(public_covers_dir, f"{s_id}.webp")
    if os.path.exists(webp_path):
        print(f"[{idx+1}/{len(KEYWORD_MAPPINGS)}] Cover for {s_id} already exists. Skipping.")
        continue
        
    print(f"[{idx+1}/{len(KEYWORD_MAPPINGS)}] Downloading cover for {s_id} (Keyword: {keyword})...")
    download_and_process(s_id, keyword)
    time.sleep(1) # Polite pause

print("History covers generation completed!")
