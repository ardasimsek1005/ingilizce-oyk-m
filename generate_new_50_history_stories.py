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
    # A1 Level (10 Stories)
    {"id": "history_cave_paintings", "title": "The Cave Paintings of Lascaux", "author": "Prehistoric France", "level": "A1", "keyword": "prehistoric-cave-drawings-glow-torchlight"},
    {"id": "history_hanging_gardens", "title": "The Hanging Gardens of Babylon", "author": "Ancient Babylon", "level": "A1", "keyword": "hanging-gardens-babylon-terraces-palace-waterfalls"},
    {"id": "history_discovery_agriculture", "title": "The Discovery of Agriculture", "author": "Ancient Mesopotamia", "level": "A1", "keyword": "primitive-farmer-wheat-field-sunlight-river"},
    {"id": "history_machu_picchu", "title": "Machu Picchu: The Lost City", "author": "Inca Empire", "level": "A1", "keyword": "machu-picchu-ruins-mountain-clouds-peru"},
    {"id": "history_first_coin", "title": "The First Coins of Lydia", "author": "Ancient Lydia", "level": "A1", "keyword": "ancient-gold-silver-coins-mint-hammer-metal"},
    {"id": "history_stonehenge", "title": "Stonehenge: The Giant Stone Circle", "author": "Prehistoric Britain", "level": "A1", "keyword": "stonehenge-stone-circle-sunrise-mist-prehistoric"},
    {"id": "history_petra_city", "title": "Petra: The City of Stone", "author": "Nabataean Kingdom", "level": "A1", "keyword": "petra-treasury-carved-pink-canyon-jordan"},
    {"id": "history_grand_canal", "title": "The Grand Canal of China", "author": "Sui Dynasty", "level": "A1", "keyword": "ancient-chinese-canal-boats-stone-bridge-willows"},
    {"id": "history_balloon_flight", "title": "The First Hot Air Balloon Flight", "author": "Montgolfier Brothers", "level": "A1", "keyword": "colorful-hot-air-balloon-floating-paris-crowd"},
    {"id": "history_steam_train", "title": "The First Steam Locomotive", "author": "George Stephenson", "level": "A1", "keyword": "early-steam-train-engine-tracks-smoke-england"},

    # A2 Level (10 Stories)
    {"id": "history_aztec_tenochtitlan", "title": "Tenochtitlan: The Aztec Capital", "author": "Aztec Empire", "level": "A2", "keyword": "aztec-temple-floating-gardens-lake-city-mexico"},
    {"id": "history_library_baghdad", "title": "The House of Wisdom in Baghdad", "author": "Abbasid Caliphate", "level": "A2", "keyword": "ancient-library-baghdad-scholars-scrolls-astrolabe"},
    {"id": "history_angkor_wat", "title": "Angkor Wat: The Temple in the Jungle", "author": "Khmer Empire", "level": "A2", "keyword": "angkor-wat-stone-towers-jungle-roots-reflection-pool"},
    {"id": "history_william_conqueror", "title": "William the Conqueror and the Battle of Hastings", "author": "Norman England", "level": "A2", "keyword": "norman-knight-armor-battle-hastings-shield-wall"},
    {"id": "history_terracotta_army", "title": "The Terracotta Army of China", "author": "Qin Dynasty", "level": "A2", "keyword": "terracotta-soldiers-rows-clay-warriors-tomb-china"},
    {"id": "history_charlemagne_crowned", "title": "Charlemagne: The Emperor of the West", "author": "Frankish Kingdom", "level": "A2", "keyword": "charlemagne-emperor-pope-crown-cathedral-altar"},
    {"id": "history_lighthouse_alexandria", "title": "The Lighthouse of Alexandria", "author": "Ptolemaic Egypt", "level": "A2", "keyword": "pharos-lighthouse-alexandria-huge-fire-sea-ships"},
    {"id": "history_galleon_voyages", "title": "The Voyages of the Spanish Galleons", "author": "Spanish Empire", "level": "A2", "keyword": "spanish-galleon-sailing-ship-stormy-ocean-cannon"},
    {"id": "history_florence_cathedral", "title": "Brunelleschi's Dome in Florence", "author": "Renaissance Italy", "level": "A2", "keyword": "florence-duomo-dome-red-bricks-scaffolding-renaissance"},
    {"id": "history_first_subway", "title": "The London Underground: The First Subway", "author": "Victorian London", "level": "A2", "keyword": "steam-subway-train-underground-station-victorian-crowd"},

    # B1 Level (10 Stories)
    {"id": "history_byzantine_justinian", "title": "Justinian and the Building of Hagia Sophia", "author": "Byzantine Empire", "level": "B1", "keyword": "hagia-sophia-byzantine-emperor-justinian-mosaic-domes"},
    {"id": "history_crusades_saladin", "title": "Saladin and the Crusades", "author": "Ayyubid Sultanate", "level": "B1", "keyword": "saladin-sultan-armor-horse-desert-crusaders-shield"},
    {"id": "history_black_prince", "title": "The Battle of Crecy and the Black Prince", "author": "Edward the Black Prince", "level": "B1", "keyword": "english-longbowmen-archers-battle-crecy-knights-arrows"},
    {"id": "history_mughal_akbar", "title": "Akbar the Great and the Mughal Empire", "author": "Mughal India", "level": "B1", "keyword": "akbar-emperor-court-darbar-rich-textiles-elephants"},
    {"id": "history_shakespeare_globe", "title": "William Shakespeare and the Globe Theatre", "author": "Elizabethan England", "level": "B1", "keyword": "william-shakespeare-quill-globe-theatre-wooden-stage"},
    {"id": "history_petra_rediscovery", "title": "The Rediscovery of Petra by Burckhardt", "author": "Johann Ludwig Burckhardt", "level": "B1", "keyword": "explorer-rediscovering-petra-canyon-desert-arabian-garb"},
    {"id": "history_gold_rush", "title": "The California Gold Rush of 1849", "author": "American Pioneers", "level": "B1", "keyword": "panning-gold-river-pioneer-shovel-sierra-nevada"},
    {"id": "history_suez_canal", "title": "The Opening of the Suez Canal", "author": "Ferdinand de Lesseps", "level": "B1", "keyword": "suez-canal-steamships-sailing-desert-opening-ceremony"},
    {"id": "history_panama_canal", "title": "The Building of the Panama Canal", "author": "Panama Canal Zone", "level": "B1", "keyword": "panama-canal-steam-shovels-cut-mountain-workers"},
    {"id": "history_first_telephone", "title": "Alexander Graham Bell and the Telephone", "author": "Alexander Graham Bell", "level": "B1", "keyword": "alexander-graham-bell-speaking-first-telephone-wires"},

    # B2 Level (10 Stories)
    {"id": "history_magellan_voyage", "title": "Magellan's Circumnavigation of the Globe", "author": "Ferdinand Magellan", "level": "B2", "keyword": "magellan-fleet-wooden-ships-strait-cliffs-ocean"},
    {"id": "history_pasteur_germs", "title": "Louis Pasteur and the Germ Theory of Disease", "author": "Louis Pasteur", "level": "B2", "keyword": "louis-pasteur-microscope-flasks-laboratory-vaccines"},
    {"id": "history_darwin_galapagos", "title": "Charles Darwin and the Voyage of the Beagle", "author": "Charles Darwin", "level": "B2", "keyword": "charles-darwin-galapagos-giant-tortoise-hms-beagle"},
    {"id": "history_boston_massacre", "title": "The Boston Massacre and the Spark of Revolution", "author": "American Colonies", "level": "B2", "keyword": "boston-massacre-british-redcoats-firing-crowd-snow"},
    {"id": "history_meiji_restoration", "title": "The Meiji Restoration: Modernizing Japan", "author": "Emperor Meiji", "level": "B2", "keyword": "emperor-meiji-samurai-modern-japanese-soldiers-railway"},
    {"id": "history_gold_standard", "title": "The Rise and Fall of the Gold Standard", "author": "Financial History", "level": "B2", "keyword": "gold-bars-bank-vault-coins-currency-finance"},
    {"id": "history_turing_machine", "title": "Alan Turing and the Enigma Code", "author": "Alan Turing", "level": "B2", "keyword": "alan-turing-enigma-decryption-machine-bletchley-park"},
    {"id": "history_first_computer", "title": "The ENIAC: The First Digital Computer", "author": "J. Presper Eckert", "level": "B2", "keyword": "eniac-first-computer-giant-vacuum-tubes-wires-operators"},
    {"id": "history_space_sputnik", "title": "Sputnik: The Start of the Space Age", "author": "Soviet Space Program", "level": "B2", "keyword": "sputnik-satellite-orbiting-earth-space-stars-antenna"},
    {"id": "history_internet_arpanet", "title": "ARPANET: The Birth of the Internet", "author": "Defense Advanced Research Projects Agency", "level": "B2", "keyword": "computer-mainframe-scientists-arpanet-network-nodes-glow"},

    # C1 Level (10 Stories)
    {"id": "history_punic_wars", "title": "The Punic Wars: Rome vs. Carthage", "author": "Rome and Carthage", "level": "C1", "keyword": "hannibal-war-elephants-crossing-alps-snowy-mountains"},
    {"id": "history_constantine_rome", "title": "Constantine the Great and the Christianization of Rome", "author": "Roman Empire", "level": "C1", "keyword": "emperor-constantine-shield-milvian-bridge-vision-cross"},
    {"id": "history_ottoman_rise", "title": "The Rise of the Ottoman Empire under Suleiman", "author": "Suleiman the Magnificent", "level": "C1", "keyword": "suleiman-magnificent-court-turban-silk-tapestry-weapons"},
    {"id": "history_spanish_armada", "title": "The Defeat of the Spanish Armada", "author": "Elizabethan Navy", "level": "C1", "keyword": "spanish-armada-burning-ships-galleons-storm-england"},
    {"id": "history_scientific_revolution", "title": "The Scientific Revolution: From Copernicus to Newton", "author": "Early Modern Science", "level": "C1", "keyword": "copernicus-astronomy-sun-centered-system-drawings-telescope"},
    {"id": "history_napoleonic_wars", "title": "The Napoleonic Wars and the Battle of Waterloo", "author": "Napoleon Bonaparte", "level": "C1", "keyword": "napoleon-horseback-battle-waterloo-cavalry-charge"},
    {"id": "history_tokugawa_shogunate", "title": "The Tokugawa Shogunate and Edo Japan", "author": "Tokugawa Ieyasu", "level": "C1", "keyword": "edo-castle-japan-tokugawa-shogun-court-samurai-cherry-blossoms"},
    {"id": "history_treaty_versailles", "title": "The Treaty of Versailles and the League of Nations", "author": "World War I Aftermath", "level": "C1", "keyword": "signing-treaty-versailles-hall-of-mirrors-diplomats"},
    {"id": "history_quantum_physics", "title": "The Solvay Conference and the Birth of Quantum Physics", "author": "Max Planck and Albert Einstein", "level": "C1", "keyword": "solvay-conference-einstein-planck-curie-quantum-physics-black-white"},
    {"id": "history_cuban_missile", "title": "The Cuban Missile Crisis: At the Brink of War", "author": "Cold War Leaders", "level": "C1", "keyword": "cuban-missile-crisis-military-map-missiles-ships-oval-office"}
]

DATA_FILE = "new_50_history_stories_data.json"

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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={api_key}"
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
        
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
    
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=90) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content.strip())
        except Exception as e:
            err_str = str(e)
            if "429" in err_str:
                print(f"  Rate limited (429). Sleeping for 45 seconds (Attempt {attempt + 1}/5)...", flush=True)
                time.sleep(45)
            elif "404" in err_str or "model" in err_str.lower():
                print("  Model gemini-3.1-flash-lite error/not found. Trying gemini-flash-lite-latest...", flush=True)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
                req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
                time.sleep(5)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 15 seconds...", flush=True)
                time.sleep(15)
    return None

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} History stories...", flush=True)
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)", flush=True)
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...", flush=True)
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write historical narratives for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across exactly 6 parts. Crucial rule: The story events, key figures, and locations MUST strictly match real historical facts about '{story['title']}' without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 6:
        print(f"  Generating Part {chapter}/6...", flush=True)
        prompt = f"Write Part {chapter} of the history story '{story['title']}' about '{story['author']}'. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 110-130 words in length to satisfy the 2000-2500 words total count. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the real historical events. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
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

print("\n--- Story Generation Phase Complete! ---")
