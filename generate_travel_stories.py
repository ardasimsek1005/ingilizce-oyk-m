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
    {"id": "travel_culture_eiffel_tower", "title": "A Day at the Eiffel Tower", "author": "Travel Guides", "level": "A1", "keyword": "eiffel-tower-paris-flowers-cute-girl-traveler"},
    {"id": "travel_culture_big_ben", "title": "Visiting Big Ben", "author": "Travel Guides", "level": "A1", "keyword": "big-ben-london-clock-tower-raincoat-boy-holding-umbrella"},
    {"id": "travel_culture_venice_gondola", "title": "The Venice Gondola Ride", "author": "Travel Guides", "level": "A1", "keyword": "gondola-boat-water-canal-venice-italy-smiling-gondolier"},
    {"id": "travel_culture_tokyo_lights", "title": "Tokyo Subway Adventure", "author": "World Explorer", "level": "A1", "keyword": "tokyo-neon-subway-station-smiling-young-traveler-backpack"},
    {"id": "travel_culture_egypt_pyramids", "title": "Seeing the Great Pyramids", "author": "World Explorer", "level": "A1", "keyword": "pyramids-giza-egypt-camel-desert-smiling-boy-explorer"},
    {"id": "travel_culture_great_wall", "title": "Walking the Great Wall", "author": "World Explorer", "level": "A1", "keyword": "great-wall-china-mountains-greenery-smiling-girl-backpack"},
    {"id": "travel_culture_colosseum", "title": "Inside the Roman Colosseum", "author": "Travel Guides", "level": "A1", "keyword": "colosseum-rome-italy-sunny-day-tourist-taking-photo"},
    {"id": "travel_culture_pisa_tower", "title": "The Leaning Tower of Pisa", "author": "Travel Guides", "level": "A1", "keyword": "leaning-tower-pisa-italy-holding-up-tower-funny-tourist"},
    {"id": "travel_culture_grand_canyon", "title": "Camping in the Grand Canyon", "author": "World Explorer", "level": "A1", "keyword": "grand-canyon-tent-campfire-mountains-stars-happy-camper"},
    {"id": "travel_culture_taj_mahal", "title": "The Beautiful Taj Mahal", "author": "World Explorer", "level": "A1", "keyword": "taj-mahal-india-gardens-reflecting-pool-happy-traveler"},
    {"id": "travel_culture_sydney_opera", "title": "Sydney Opera House Tour", "author": "Travel Guides", "level": "A1", "keyword": "sydney-opera-house-harbor-bridge-boat-sea-seagull"},
    {"id": "travel_culture_amsterdam_tulips", "title": "Amsterdam Tulip Fields", "author": "World Explorer", "level": "A1", "keyword": "amsterdam-windmill-tulip-fields-canal-bicycle-smiling-girl"},
    {"id": "travel_culture_statue_liberty", "title": "The Statue of Liberty Visit", "author": "Travel Guides", "level": "A1", "keyword": "statue-of-liberty-new-york-harbor-ferry-boat-happy-boy"},
    {"id": "travel_culture_rio_carnival", "title": "Rio de Janeiro Carnival", "author": "World Explorer", "level": "A1", "keyword": "rio-carnival-costume-dancing-smiling-girl-sugarloaf-mountain"},
    {"id": "travel_culture_london_eye", "title": "Riding the London Eye", "author": "Travel Guides", "level": "A1", "keyword": "london-eye-wheel-thames-river-big-ben-smiling-family"},

    # A2 Level (15 Stories)
    {"id": "travel_culture_mount_fuji", "title": "Climbing Mount Fuji", "author": "World Explorer", "level": "A2", "keyword": "mount-fuji-japan-cherry-blossoms-smiling-hiker-climbing"},
    {"id": "travel_culture_serengeti_safari", "title": "Serengeti National Park Safari", "author": "World Explorer", "level": "A2", "keyword": "serengeti-safari-jeep-lion-giraffe-savanna-sunrise-tourist"},
    {"id": "travel_culture_machu_picchu_hike", "title": "Hiking to Machu Picchu", "author": "World Explorer", "level": "A2", "keyword": "machu-picchu-peru-llama-mountains-lost-city-smiling-hiker"},
    {"id": "travel_culture_petra_jordan", "title": "The Treasury of Petra", "author": "World Explorer", "level": "A2", "keyword": "petra-jordan-treasury-canyon-camel-smiling-archaeologist"},
    {"id": "travel_culture_chichen_itza", "title": "Chichen Itza Mayan Temple", "author": "World Explorer", "level": "A2", "keyword": "chichen-itza-mayan-pyramid-mexico-jungle-traveler-hat"},
    {"id": "travel_culture_niagara_falls", "title": "Maid of the Mist at Niagara", "author": "Travel Guides", "level": "A2", "keyword": "niagara-falls-waterfall-boat-blue-poncho-water-spray"},
    {"id": "travel_culture_stonehenge_visit", "title": "A Sunset at Stonehenge", "author": "Travel Guides", "level": "A2", "keyword": "stonehenge-england-prehistoric-stones-golden-sunset-tourists"},
    {"id": "travel_culture_barcelona_gaudi", "title": "The Magic of Park Guell", "author": "Travel Guides", "level": "A2", "keyword": "park-guell-barcelona-colorful-mosaic-salamander-gaudi-girl"},
    {"id": "travel_culture_iceland_geysers", "title": "Iceland Hot Springs and Geysers", "author": "World Explorer", "level": "A2", "keyword": "iceland-geyser-eruption-steam-hot-spring-waterfall-hiker"},
    {"id": "travel_culture_bali_temples", "title": "Bali Rice Terraces and Temples", "author": "World Explorer", "level": "A2", "keyword": "bali-rice-terraces-green-fields-water-temple-smiling-girl"},
    {"id": "travel_culture_san_francisco_bridge", "title": "Crossing the Golden Gate", "author": "Travel Guides", "level": "A2", "keyword": "golden-gate-bridge-san-francisco-fog-red-bridge-cable-car"},
    {"id": "travel_culture_vatican_museums", "title": "Secrets of the Vatican", "author": "Travel Guides", "level": "A2", "keyword": "vatican-st-peters-basilica-square-rome-smiling-tourist"},
    {"id": "travel_culture_istanbul_bazaar", "title": "The Grand Bazaar of Istanbul", "author": "World Explorer", "level": "A2", "keyword": "grand-bazaar-istanbul-turkey-colorful-lanterns-spices-carpet"},
    {"id": "travel_culture_swiss_alps", "title": "Train Ride in the Swiss Alps", "author": "Travel Guides", "level": "A2", "keyword": "swiss-alps-red-train-snowy-mountains-pine-trees-smiling-boy"},
    {"id": "travel_culture_hawaii_luau", "title": "Hawaiian Luau and Beaches", "author": "Travel Guides", "level": "A2", "keyword": "hawaii-beach-luau-fire-dancer-tropical-palm-trees-sunset"},

    # B1 Level (10 Stories)
    {"id": "travel_culture_galapagos_islands", "title": "Galapagos Wildlife Expedition", "author": "World Explorer", "level": "B1", "keyword": "galapagos-giant-tortoise-sea-lion-volcano-island-explorer"},
    {"id": "travel_culture_angkor_wat_jungle", "title": "Angkor Wat Temple Exploration", "author": "World Explorer", "level": "B1", "keyword": "angkor-wat-temple-cambodia-banyan-tree-roots-stone-face"},
    {"id": "travel_culture_venice_carnival", "title": "The Masquerade of Venice", "author": "Travel Guides", "level": "B1", "keyword": "venice-carnival-mask-costume-gondola-st-marks-square"},
    {"id": "travel_culture_scottish_highlands", "title": "Legends of the Scottish Highlands", "author": "Travel Guides", "level": "B1", "keyword": "scottish-highlands-loch-ness-castle-misty-hills-bagpiper"},
    {"id": "travel_culture_morocco_souks", "title": "A Journey Through Marrakech", "author": "World Explorer", "level": "B1", "keyword": "marrakech-morocco-souk-spices-colorful-rugs-camel-square"},
    {"id": "travel_culture_cappadocia_balloons", "title": "Hot Air Balloons of Cappadocia", "author": "World Explorer", "level": "B1", "keyword": "cappadocia-turkey-hot-air-balloons-fairy-chimneys-sunrise"},
    {"id": "travel_culture_great_barrier_reef", "title": "Diving the Great Barrier Reef", "author": "World Explorer", "level": "B1", "keyword": "great-barrier-reef-australia-coral-fish-diver-sea-turtle"},
    {"id": "travel_culture_trans_siberian", "title": "The Trans-Siberian Railway", "author": "World Explorer", "level": "B1", "keyword": "trans-siberian-train-snowy-forest-russia-cozy-compartment"},
    {"id": "travel_culture_peru_nazca", "title": "Flying Over the Nazca Lines", "author": "World Explorer", "level": "B1", "keyword": "nazca-lines-peru-desert-plane-monkey-glyph-aerial-view"},
    {"id": "travel_culture_banff_canada", "title": "Lake Louise in Banff", "author": "Travel Guides", "level": "B1", "keyword": "lake-louise-banff-canada-turquoise-water-canoe-mountains"},

    # B2 Level (10 Stories)
    {"id": "travel_culture_tibet_potala", "title": "The Potala Palace of Lhasa", "author": "World Explorer", "level": "B2", "keyword": "potala-palace-lhasa-tibet-mountains-monk-prayer-flags"},
    {"id": "travel_culture_amazon_rainforest", "title": "Navigating the Amazon River", "author": "World Explorer", "level": "B2", "keyword": "amazon-rainforest-river-boat-macaw-jaguar-dense-jungle"},
    {"id": "travel_culture_kyoto_gardens", "title": "The Zen Gardens of Kyoto", "author": "Travel Guides", "level": "B2", "keyword": "zen-garden-kyoto-japan-bamboo-forest-geisha-temple"},
    {"id": "travel_culture_dbx_desert", "title": "Dubai: From Dunes to Skyscrapers", "author": "World Explorer", "level": "B2", "keyword": "dubai-skyscrapers-burj-khalifa-desert-dunes-camel-falcon"},
    {"id": "travel_culture_madagascar_baobabs", "title": "Avenue of the Baobabs", "author": "World Explorer", "level": "B2", "keyword": "avenue-baobabs-madagascar-giant-trees-lemur-sunset-hiker"},
    {"id": "travel_culture_route_66", "title": "Road Trip on Route 66", "author": "Travel Guides", "level": "B2", "keyword": "route-66-road-trip-classic-car-diner-neon-sign-desert"},
    {"id": "travel_culture_patagonia_glaciers", "title": "Trekking in Patagonia", "author": "World Explorer", "level": "B2", "keyword": "patagonia-glacier-blue-ice-mountain-peaks-lake-hiking"},
    {"id": "travel_culture_lofotens_norway", "title": "The Fishing Villages of Lofoten", "author": "Travel Guides", "level": "B2", "keyword": "lofoten-islands-norway-red-cabins-fjord-mountains-aurora"},
    {"id": "travel_culture_rajasthan_forts", "title": "The Pink City of Jaipur", "author": "World Explorer", "level": "B2", "keyword": "hawa-mahal-palace-winds-jaipur-india-colorful-turban-man"},
    {"id": "travel_culture_dead_sea", "title": "Floating in the Dead Sea", "author": "World Explorer", "level": "B2", "keyword": "dead-sea-floating-salty-water-mud-mask-hills-jordan"},

    # C1 Level (10 Stories)
    {"id": "travel_culture_silk_road", "title": "Samarkand: Heart of the Silk Road", "author": "World Explorer", "level": "C1", "keyword": "registan-square-samarkand-uzbekistan-blue-tiles-caravan"},
    {"id": "travel_culture_petra_discovery", "title": "Rediscovering the Nabataean Empire", "author": "World Explorer", "level": "C1", "keyword": "petra-monastery-carved-rock-archaeology-desert-canyon"},
    {"id": "travel_culture_lhasa_journey", "title": "The Spiritual Path to Lhasa", "author": "World Explorer", "level": "C1", "keyword": "monks-praying-temple-butter-lamps-tibet-himalayas"},
    {"id": "travel_culture_galapagos_evolution", "title": "In the Footsteps of Darwin", "author": "World Explorer", "level": "C1", "keyword": "hms-beagle-ship-galapagos-finch-mockingbird-darwin-journal"},
    {"id": "travel_culture_easter_island", "title": "Mysteries of Easter Island Moai", "author": "World Explorer", "level": "C1", "keyword": "easter-island-moai-stone-statues-green-hills-pacific-ocean"},
    {"id": "travel_culture_bhutan_monastery", "title": "Tiger's Nest Monastery of Bhutan", "author": "World Explorer", "level": "C1", "keyword": "tigers-nest-monastery-bhutan-cliff-clouds-buddhist-temple"},
    {"id": "travel_culture_venice_architecture", "title": "The Byzantine Legacy of Venice", "author": "Travel Guides", "level": "C1", "keyword": "st-marks-basilica-venice-byzantine-domes-gilded-mosaics"},
    {"id": "travel_culture_sahara_nomads", "title": "Caravans of the Sahara Desert", "author": "World Explorer", "level": "C1", "keyword": "sahara-desert-sand-dunes-camel-caravan-tuareg-blue-robe"},
    {"id": "travel_culture_machu_picchu_masonry", "title": "Inca Masonry and Astronomy", "author": "World Explorer", "level": "C1", "keyword": "machu-picchu-sun-temple-stonework-terraces-clouds-mountains"},
    {"id": "travel_culture_svalbard_arctic", "title": "The Frozen Wilderness of Svalbard", "author": "World Explorer", "level": "C1", "keyword": "svalbard-arctic-polar-bear-glacier-snowmobile-northern-lights"}
]

DATA_FILE = "travel_culture_stories_data.json"

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
    models = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemini-2.5-flash"]
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

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Travel & Culture stories...", flush=True)
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)", flush=True)
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...", flush=True)
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write travel and cultural narratives for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across exactly 6 parts. Crucial rule: The story events, geographic locations, and cultural descriptions MUST strictly match real-world facts about '{story['title']}' without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 6:
        print(f"  Generating Part {chapter}/6...", flush=True)
        prompt = f"Write Part {chapter} of the travel and culture story '{story['title']}' from '{story['author']}'. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 110-130 words in length to satisfy the 2000-2500 words total count. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the real-world travel and cultural facts. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
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

print("\n--- Travel & Culture Story Generation Phase Complete! ---", flush=True)
