import os
import urllib.request
import urllib.parse
import time
from PIL import Image

public_covers_dir = r"C:\Users\acer\antigravity\ingilizce-oykum\public\covers"
scratch_covers_dir = r"C:\Users\acer\antigravity\ingilizce-oykum\scratch\scifi\covers"

# Ensure dirs exist
os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

# 50 Unsplash image keywords for Sci-Fi covers
KEYWORD_MAPPINGS = {
    "scifi_time_machine": "hourglass-futuristic-time-travel",
    "scifi_journey_center_earth": "cave-underground-lava-adventure",
    "scifi_twenty_thousand_leagues": "submarine-underwater-ocean-depths",
    "scifi_robie": "friendly-robot-child-companion",
    "scifi_runaround": "robot-industrial-desert-planet",
    "scifi_star_beast": "cute-alien-creature-pet",
    "scifi_lost_world": "jungle-dinosaurs-prehistoric-plateau",
    "scifi_from_earth_to_moon": "vintage-moon-rocket-spaceflight",
    "scifi_propeller_island": "floating-city-island-ocean-machine",
    "scifi_star_maker": "nebula-stars-cosmic-universe",
    
    "scifi_invisible_man": "invisible-ghostly-coat-laboratory",
    "scifi_war_worlds": "alien-tripod-invasion-spaceship",
    "scifi_frankenstein": "gothic-castle-laboratory-electricity",
    "scifi_island_dr_moreau": "jungle-laboratory-experiments-beasts",
    "scifi_first_men_moon": "astronauts-lunar-surface-exploration",
    "scifi_around_moon": "capsule-flying-past-lunar-craters",
    "scifi_youth": "two-boys-finding-small-alien",
    "scifi_reason": "philosophical-robot-space-station",
    "scifi_food_of_gods": "giant-plants-oversized-nature",
    "scifi_chocky": "glowing-imaginary-alien-friend",
    "scifi_wells_star": "giant-burning-star-sky-earth",
    "scifi_new_hope": "space-fleet-starship-battle",
    "scifi_liar": "mind-reading-android-humanoid",
    "scifi_strange_case_dr_jekyll": "vintage-apothecary-glowing-potion",
    "scifi_the_chrysalids": "mutated-crops-post-apocalyptic-ruins",
    
    "scifi_i_robot": "metallic-humanoid-robot-head",
    "scifi_nightfall": "eclipse-six-suns-dark-sky",
    "scifi_sentinel": "strange-monolith-pyramid-moon",
    "scifi_nine_billion_names": "monastery-supercomputer-mountains",
    "scifi_sound_of_thunder": "tyrannosaurus-rex-dinosaur-time-machine",
    "scifi_martian_chronicles": "red-planet-mars-colony-domes",
    "scifi_veldt": "virtual-reality-hologram-african-savanna",
    "scifi_soft_rains": "abandoned-futuristic-smart-house-sunset",
    "scifi_arena": "glowing-forcefield-arena-desert",
    "scifi_expedition": "spaceship-landing-alien-swamp",
    "scifi_escape_velocity": "orbit-satellite-spacewalk-astronaut",
    "scifi_evidence": "futuristic-city-hall-robot-politician",
    "scifi_clarke_star": "supernova-explosion-cosmic-ruins",
    
    "scifi_do_androids_dream": "cyberpunk-rainy-neon-city-android",
    "scifi_minority_report": "holographic-data-interface-police",
    "scifi_total_recall": "memory-implant-chair-virtual-vacation",
    "scifi_time_patrol": "futuristic-soldiers-protecting-time-portal",
    "scifi_day_of_triffids": "carnivorous-plants-blind-city-streets",
    "scifi_midwich_cuckoos": "mysterious-glowing-eyed-children",
    "scifi_cold_equations": "cramped-spaceship-cockpit-stars",
    "scifi_bicentennial_man": "robot-becoming-human-cyborg",
    "scifi_last_question": "giant-space-supercomputer-cosmic-nebula",
    
    "scifi_machine_stops": "massive-underground-beehive-technological-city",
    "scifi_solitude": "isolated-pod-alien-nature",
    "scifi_by_waters_of_babylon": "ruined-skyscraper-forest-overgrown"
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
    # Use Unsplash Source API or modern direct unsplash search matching
    url = f"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80" # Default abstract
    
    # Customize standard unsplash search redirection to fetch relevant images
    query = urllib.parse.quote(keyword.replace("-", " ") + " sci fi")
    search_url = f"https://source.unsplash.com/featured/500x500/?{query}"
    
    # Modern unsplash source might redirect. Use direct download.
    # We will try to download from source.unsplash, if it fails, we fall back to a beautiful curated abstract sci-fi image.
    temp_path = f"temp_{s_id}.jpg"
    try:
        req = urllib.request.Request(
            search_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req) as response:
            with open(temp_path, "wb") as f:
                f.write(response.read())
    except Exception as e:
        print(f"  Unsplash source failed for {s_id}: {e}. Downloading curated abstract...")
        try:
            req = urllib.request.Request(
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80",
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req) as response:
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
            
            # Save PNG to scratch/scifi/covers
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

print(f"Downloading and optimizing {len(KEYWORD_MAPPINGS)} Sci-Fi covers...")
for idx, (s_id, keyword) in enumerate(KEYWORD_MAPPINGS.items()):
    webp_path = os.path.join(public_covers_dir, f"{s_id}.webp")
    if os.path.exists(webp_path):
        print(f"[{idx+1}/{len(KEYWORD_MAPPINGS)}] Cover for {s_id} already exists. Skipping.")
        continue
        
    print(f"[{idx+1}/{len(KEYWORD_MAPPINGS)}] Downloading cover for {s_id} (Keyword: {keyword})...")
    download_and_process(s_id, keyword)
    time.sleep(1) # Polite pause

print("Sci-Fi covers generation completed!")
