import os
import json
import time
import urllib.request
import urllib.parse
import re
from generator_refiner import refine_story

# Read API Key from .env
api_key = ""
if os.path.exists(".env"):
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

if not api_key:
    print("API Key not found in .env!")
    exit(1)

STORIES_TO_GENERATE = [
    # A1 Level (15 Stories)
    {"id": "nature_space_red_planet", "title": "My Trip to the Red Planet", "author": "Space Science", "level": "A1", "keyword": "red-planet-mars-rover-cute-astronaut-smiling-alien"},
    {"id": "nature_space_milky_way", "title": "The Milky Way Stars", "author": "Space Science", "level": "A1", "keyword": "milky-way-galaxy-spiral-stars-telescope-smiling-boy"},
    {"id": "nature_space_rainbow_magic", "title": "How Rainbows are Made", "author": "Nature Explorer", "level": "A1", "keyword": "rainbow-sky-rain-drops-sun-clouds-happy-cartoon-child"},
    {"id": "nature_space_polar_bears", "title": "The Life of Polar Bears", "author": "Nature Explorer", "level": "A1", "keyword": "polar-bear-cub-arctic-ice-snow-cute-smiling"},
    {"id": "nature_space_butterfly_flight", "title": "The Butterfly's New Wings", "author": "Nature Explorer", "level": "A1", "keyword": "monarch-butterfly-flower-garden-sunshine-caterpillar"},
    {"id": "nature_space_moon_landing", "title": "Walking on the Moon", "author": "Space Science", "level": "A1", "keyword": "moon-landing-astronaut-american-flag-earth-in-background"},
    {"id": "nature_space_deep_ocean", "title": "Under the Blue Ocean", "author": "Nature Explorer", "level": "A1", "keyword": "deep-ocean-submarines-dolphin-fish-coral-reef-glowing"},
    {"id": "nature_space_bee_hive", "title": "The Busy Little Bee", "author": "Nature Explorer", "level": "A1", "keyword": "honey-bee-beehive-flower-pollen-smiling-queen-bee"},
    {"id": "nature_space_green_forest", "title": "The Secret of the Forest", "author": "Nature Explorer", "level": "A1", "keyword": "green-forest-deer-fawn-birds-squirrel-glowing-mushrooms"},
    {"id": "nature_space_shooting_star", "title": "Make a Wish: Shooting Stars", "author": "Space Science", "level": "A1", "keyword": "shooting-star-night-sky-telescope-bedroom-window-child"},
    {"id": "nature_space_volcano_island", "title": "The Volcano Island", "author": "Nature Explorer", "level": "A1", "keyword": "volcano-erupting-lava-smoke-ocean-island-dinosaur"},
    {"id": "nature_space_solar_system", "title": "The Family of Planets", "author": "Space Science", "level": "A1", "keyword": "solar-system-sun-planets-orbit-colorful-space-ship"},
    {"id": "nature_space_aurora_lights", "title": "The Dancing Green Lights", "author": "Nature Explorer", "level": "A1", "keyword": "northern-lights-aurora-borealis-cabin-snowy-trees-stars"},
    {"id": "nature_space_coral_reef", "title": "The Great Barrier Reef Friends", "author": "Nature Explorer", "level": "A1", "keyword": "coral-reef-clownfish-anemone-sea-turtle-underwater"},
    {"id": "nature_space_ant_empire", "title": "The Tiny Ant Empire", "author": "Nature Explorer", "level": "A1", "keyword": "ant-hill-tunnel-underground-ants-carrying-leaves-grass"},

    # A2 Level (15 Stories)
    {"id": "nature_space_ringed_saturn", "title": "The Rings of Saturn", "author": "Space Science", "level": "A2", "keyword": "saturn-rings-space-probe-astronaut-floating-ice-rocks"},
    {"id": "nature_space_deep_cave", "title": "Exploring the Crystal Cave", "author": "Nature Explorer", "level": "A2", "keyword": "crystal-cave-stalactite-stalagmite-subterranean-lake-glow"},
    {"id": "nature_space_rainforest_canopy", "title": "Secrets of the Amazon Canopy", "author": "Nature Explorer", "level": "A2", "keyword": "amazon-canopy-sloth-toucan-treehouse-jungle-fog"},
    {"id": "nature_space_black_holes", "title": "The Monster Black Hole", "author": "Space Science", "level": "A2", "keyword": "black-hole-singularity-gravitational-lensing-stars-swirling"},
    {"id": "nature_space_great_desert", "title": "Survival in the Sahara", "author": "Nature Explorer", "level": "A2", "keyword": "sahara-desert-fennec-fox-cactus-oasis-sand-dunes"},
    {"id": "nature_space_comet_tail", "title": "The Ice Voyager: Halley's Comet", "author": "Space Science", "level": "A2", "keyword": "comet-halley-ice-tail-glowing-stars-solar-system"},
    {"id": "nature_space_deep_sea_vent", "title": "Volcanoes of the Deep Sea", "author": "Nature Explorer", "level": "A2", "keyword": "hydrothermal-vent-black-smoker-deep-sea-shrimp-tubeworms"},
    {"id": "nature_space_mighty_glacier", "title": "The Moving Ice Glacier", "author": "Nature Explorer", "level": "A2", "keyword": "glacier-crevasse-iceberg-falling-water-seal-antarctica"},
    {"id": "nature_space_great_migration", "title": "The Journey of the Monarchs", "author": "Nature Explorer", "level": "A2", "keyword": "monarch-butterflies-migrating-pine-trees-forest-millions"},
    {"id": "nature_space_chameleon_colors", "title": "The Chameleon's Camouflage", "author": "Nature Explorer", "level": "A2", "keyword": "chameleon-lizard-changing-color-branch-jungle-eyes"},
    {"id": "nature_space_thunderstorm_power", "title": "The Power of Lightning", "author": "Nature Explorer", "level": "A2", "keyword": "lightning-strike-thunderstorm-dark-clouds-rain-fields"},
    {"id": "nature_space_asteroid_belt", "title": "Journey Through the Asteroids", "author": "Space Science", "level": "A2", "keyword": "asteroid-belt-space-shuttle-rocks-colliding-galaxy"},
    {"id": "nature_space_giant_redwoods", "title": "The Giant Redwood Forest", "author": "Nature Explorer", "level": "A2", "keyword": "giant-redwood-sequoia-tree-sun-rays-cabin-forest"},
    {"id": "nature_space_deep_trench", "title": "Mariana Trench: The Deepest Abyss", "author": "Nature Explorer", "level": "A2", "keyword": "mariana-trench-anglerfish-bioluminescent-creatures-submarine"},
    {"id": "nature_space_mars_water", "title": "Water on the Red Planet", "author": "Space Science", "level": "A2", "keyword": "mars-frozen-ice-caps-water-crystals-crater-rover"},

    # B1 Level (10 Stories)
    {"id": "nature_space_exoplanets", "title": "Searching for New Earths", "author": "Space Science", "level": "B1", "keyword": "exoplanet-kepler-alien-world-two-suns-oceans-continents"},
    {"id": "nature_space_supernova", "title": "The Death of a Giant Star", "author": "Space Science", "level": "B1", "keyword": "supernova-nebula-explosion-glowing-gas-cosmic-dust"},
    {"id": "nature_space_ocean_tides", "title": "The Moon and the Ocean Tides", "author": "Nature Explorer", "level": "B1", "keyword": "high-tide-low-tide-beach-moon-gravitational-pull"},
    {"id": "nature_space_jungle_bioluminescence", "title": "The Glowing Night Forest", "author": "Nature Explorer", "level": "B1", "keyword": "bioluminescent-mushrooms-glow-worms-jungle-night-avatar"},
    {"id": "nature_space_hubble_telescope", "title": "Hubble: The Eye in Space", "author": "Space Science", "level": "B1", "keyword": "hubble-space-telescope-orbiting-earth-nebula-stars"},
    {"id": "nature_space_migrating_whales", "title": "The Song of the Humpback Whales", "author": "Nature Explorer", "level": "B1", "keyword": "humpback-whale-breaching-ocean-blue-water-underwater"},
    {"id": "nature_space_grand_canyon_geology", "title": "Layers of Time: Grand Canyon", "author": "Nature Explorer", "level": "B1", "keyword": "grand-canyon-river-geology-rock-layers-strata-eagle"},
    {"id": "nature_space_aurora_mysteries", "title": "Solar Winds and Northern Lights", "author": "Space Science", "level": "B1", "keyword": "solar-flares-sun-earth-magnetic-shield-aurora"},
    {"id": "nature_space_pitcher_plants", "title": "Carnivorous Plants of the Jungle", "author": "Nature Explorer", "level": "B1", "keyword": "venus-flytrap-pitcher-plant-insects-jungle-damp"},
    {"id": "nature_space_voyager_probe", "title": "Voyager 1: Leaving the Solar System", "author": "Space Science", "level": "B1", "keyword": "voyager-space-probe-interstellar-space-golden-record-stars"},

    # B2 Level (10 Stories)
    {"id": "nature_space_neutron_stars", "title": "Pulsars: Cosmic Lighthouses", "author": "Space Science", "level": "B2", "keyword": "neutron-star-pulsar-magnetic-beams-spinning-nebula"},
    {"id": "nature_space_hydrothermal_life", "title": "Life Without Sun: Deep Hydrothermal Vents", "author": "Nature Explorer", "level": "B2", "keyword": "giant-tubeworms-vent-crab-deep-sea-black-smoker"},
    {"id": "nature_space_nebula_nurseries", "title": "Pillars of Creation: Star Nurseries", "author": "Space Science", "level": "B2", "keyword": "pillars-of-creation-eagle-nebula-gas-pillars-baby-stars"},
    {"id": "nature_space_earths_magnetic", "title": "The Invisible Shield: Earth's Core", "author": "Nature Explorer", "level": "B2", "keyword": "earths-magnetic-field-core-compass-aurora-solar-wind"},
    {"id": "nature_space_deep_coral", "title": "Cold-Water Coral Reefs", "author": "Nature Explorer", "level": "B2", "keyword": "deep-water-coral-reef-dark-ocean-glowing-shrimp"},
    {"id": "nature_space_james_webb", "title": "James Webb: Peering into the Past", "author": "Space Science", "level": "B2", "keyword": "james-webb-telescope-golden-honeycomb-mirror-space"},
    {"id": "nature_space_plate_tectonics", "title": "The Ring of Fire: Volcanic Arcs", "author": "Nature Explorer", "level": "B2", "keyword": "ring-of-fire-plates-fault-line-earthquake-ocean-trench"},
    {"id": "nature_space_exolife_europa", "title": "Under the Ice of Europa", "author": "Space Science", "level": "B2", "keyword": "europa-moon-jupiter-cracked-ice-submarine-underwater-ocean"},
    {"id": "nature_space_extreme_weather", "title": "Monsoons and Supercells", "author": "Nature Explorer", "level": "B2", "keyword": "supercell-storm-cloud-tornado-lightning-fields"},
    {"id": "nature_space_coral_bleaching", "title": "The Warming Oceans: Coral Reef Crisis", "author": "Nature Explorer", "level": "B2", "keyword": "bleached-white-coral-dying-reef-sad-fish-warm-ocean"},

    # C1 Level (10 Stories)
    {"id": "nature_space_cosmic_web", "title": "The Cosmic Web: Structure of the Universe", "author": "Space Science", "level": "C1", "keyword": "cosmic-web-dark-matter-filaments-galaxies-nodes"},
    {"id": "nature_space_cambrian_explosion", "title": "The Cambrian Explosion of Life", "author": "Nature Explorer", "level": "C1", "keyword": "cambrian-sea-trilobite-anomalocaris-ancient-ocean-life"},
    {"id": "nature_space_dark_matter", "title": "The Invisible Universe: Dark Matter and Energy", "author": "Space Science", "level": "C1", "keyword": "expanding-universe-dark-energy-stars-galaxies-drifting"},
    {"id": "nature_space_quantum_vacuum", "title": "Quantum Vacuum: Something from Nothing", "author": "Space Science", "level": "C1", "keyword": "virtual-particles-appearing-disappearing-quantum-foam"},
    {"id": "nature_space_great_oxidation", "title": "The Great Oxidation Event", "author": "Nature Explorer", "level": "C1", "keyword": "stromatolites-ancient-ocean-cyanobacteria-oxygen-bubbles"},
    {"id": "nature_space_event_horizon", "title": "Event Horizon: Imaging the Black Hole", "author": "Space Science", "level": "C1", "keyword": "event-horizon-telescope-ring-light-black-hole-shadow"},
    {"id": "nature_space_deep_biosphere", "title": "The Deep Biosphere: Microbes in the Crust", "author": "Nature Explorer", "level": "C1", "keyword": "underground-microbes-rock-crevices-microscopic-crust-bacteria"},
    {"id": "nature_space_gravitational_waves", "title": "Gravitational Waves: Ripples in Spacetime", "author": "Space Science", "level": "C1", "keyword": "colliding-black-holes-spacetime-ripples-waves-ligo"},
    {"id": "nature_space_permafrost_thaw", "title": "Permafrost Thaw and Ancient Viruses", "author": "Nature Explorer", "level": "C1", "keyword": "melting-permafrost-arctic-tundra-ancient-virus-microscope"},
    {"id": "nature_space_stellar_nucleosynthesis", "title": "Stellar Nucleosynthesis: We Are Stardust", "author": "Space Science", "level": "C1", "keyword": "stellar-furnace-elements-fusion-supernova-gold-iron-dust"}
]

DATA_FILE = "nature_space_stories_data.json"

# Load existing progress
if os.path.exists(DATA_FILE):
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            expanded_data = json.load(f)
    except Exception as e:
        print(f"Error loading {DATA_FILE}: {e}. Initializing empty.")
        expanded_data = {}
else:
    expanded_data = {}

def call_gemini(prompt, system_instruction=""):
    models = ["gemini-robotics-er-1.6-preview", "gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemini-2.5-flash"]
    headers = {"Content-Type": "application/json"}
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "english_paragraphs": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "3 paragraphs of the story in English, about 110-130 words each"
                    },
                    "turkish_paragraphs": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Turkish translation of each of the 3 English paragraphs"
                    },
                    "vocabulary": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                               "en": {"type": "STRING", "description": "English word (base form, lowercase)"},
                               "tr": {"type": "STRING", "description": "Turkish meaning of the word in context"}
                            },
                            "required": ["en", "tr"]
                        },
                        "description": "6 key vocabulary words extracted from this chapter"
                    }
                },
                "required": ["english_paragraphs", "turkish_paragraphs", "vocabulary"]
            }
        }
    }
    
    if system_instruction:
        data["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
        
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=90) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(text_content.strip())
            except Exception as e:
                err_str = str(e)
                body = ""
                if hasattr(e, 'read'):
                    try:
                        body = e.read().decode("utf-8")
                    except:
                        pass
                
                is_quota = "quota" in err_str.lower() or "quota" in body.lower() or "limit" in body.lower() or "exhausted" in body.lower()
                
                if "429" in err_str:
                    if is_quota:
                        print(f"  Model {model} quota exhausted. Switching to next model...", flush=True)
                        break
                    else:
                        print(f"  Model {model} rate limited (429). Sleeping for 45 seconds (Attempt {attempt + 1}/3)...", flush=True)
                        time.sleep(45)
                else:
                    print(f"  Attempt {attempt + 1} with model {model} failed: {e}. Sleeping for 15 seconds...", flush=True)
                    time.sleep(15)
        print(f"  Model {model} failed all attempts or quota exhausted. Trying next model...", flush=True)
    return None

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Nature & Space stories...", flush=True)
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)", flush=True)
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...", flush=True)
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and science writer. You write nature and space mysteries narratives for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across exactly 6 parts. Crucial rule: The story events, scientific facts, and descriptions MUST strictly match real-world observations about '{story['title']}' without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 6:
        print(f"  Generating Part {chapter}/6...", flush=True)
        prompt = f"Write Part {chapter} of the nature and space story '{story['title']}' from '{story['author']}'. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 110-130 words in length to satisfy the 2000-2500 words total count. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the real-world science or nature facts. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 90 seconds before retrying this part...", flush=True)
            time.sleep(90)
            continue
            
        def clean_p(p):
            pattern = r"^\s*(?:chapter|capture|bölüm|part|section)\s+(?:[0-9]+|[ivxldm]+)\b[:\-\s\.]*"
            cleaned = re.sub(pattern, "", p, flags=re.IGNORECASE).strip()
            if re.match(r"^\s*(?:chapter|capture|bölüm|part|section)\s*(?:[0-9]+|[ivxldm]+)?\s*$", cleaned, re.IGNORECASE):
                return ""
            return cleaned

        cleaned_en = [clean_p(p) for p in result["english_paragraphs"]]
        cleaned_en = [p for p in cleaned_en if p]

        cleaned_tr = [clean_p(p) for p in result["turkish_paragraphs"]]
        cleaned_tr = [p for p in cleaned_tr if p]

        # Check alignment
        if len(cleaned_en) != len(cleaned_tr):
            print(f"  Warning: Paragraph count mismatch (EN: {len(cleaned_en)}, TR: {len(cleaned_tr)}). Retrying this part...", flush=True)
            time.sleep(5)
            continue

        # Append paragraphs
        story_en_paragraphs.extend(cleaned_en)
        story_tr_paragraphs.extend(cleaned_tr)
        
        # Append vocabulary
        for w in result["vocabulary"]:
            en_word = w["en"].strip().lower()
            tr_word = w["tr"].strip()
            if en_word and tr_word:
                story_words[en_word] = tr_word
                
        chapter += 1
        time.sleep(2) # polite delay between parts
            
    # Refine vocabulary for CEFR A1/A2 compliance
    story_data = {
        "en": story_en_paragraphs,
        "tr": story_tr_paragraphs,
        "words": story_words
    }
    story_data = refine_story(story["level"], story_data, api_key)
    story_en_paragraphs = story_data["en"]
    story_tr_paragraphs = story_data["tr"]
    story_words = story_data["words"]

    expanded_data[s_id] = {
        "id": s_id,
        "title": story["title"],
        "author": story["author"],
        "level": story["level"],
        "coverUrl": f"/covers/{s_id}.webp",
        "en": story_en_paragraphs,
        "tr": story_tr_paragraphs,
        "words": story_words
    }
    
    # Calculate actual word count
    word_count = sum(len(p.split()) for p in story_en_paragraphs)
    print(f"  Success! Total paragraphs: {len(story_en_paragraphs)}, words: {word_count}, dictionary: {len(story_words)} words.", flush=True)
    
    # Save progress instantly
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(3)

print("\n--- Nature & Space Story Generation Phase Complete! ---", flush=True)
