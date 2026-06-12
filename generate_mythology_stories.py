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
    {"id": "mythology_pandora_box", "title": "Pandora's Box", "author": "Greek Mythology", "level": "A1", "keyword": "pandora-box-curiosity-glow-magic-smoke"},
    {"id": "mythology_midas_touch", "title": "The Midas Touch", "author": "Greek Mythology", "level": "A1", "keyword": "king-midas-golden-touch-statue-rose"},
    {"id": "mythology_hercules_lion", "title": "Hercules and the Nemean Lion", "author": "Greek Mythology", "level": "A1", "keyword": "strong-hercules-lion-fight-ancient-greek"},
    {"id": "mythology_achilles_heel", "title": "The Story of Achilles' Heel", "author": "Greek Mythology", "level": "A1", "keyword": "achilles-knight-armor-shield-arrow-heel"},
    {"id": "mythology_pegasus_flight", "title": "Pegasus the Flying Horse", "author": "Greek Mythology", "level": "A1", "keyword": "flying-white-pegasus-winged-horse-clouds"},
    {"id": "mythology_icarus_sun", "title": "Icarus and the Wax Wings", "author": "Greek Mythology", "level": "A1", "keyword": "icarus-flying-wings-wax-melting-sun"},
    {"id": "mythology_thor_hammer", "title": "Thor and His Magic Hammer", "author": "Norse Legends", "level": "A1", "keyword": "thor-holding-hammer-lightning-storm-viking"},
    {"id": "mythology_odyssey_cyclops", "title": "Odysseus and the Cyclops", "author": "Greek Mythology", "level": "A1", "keyword": "odysseus-giant-one-eye-cyclops-cave"},
    {"id": "mythology_arthur_sword", "title": "King Arthur and the Sword in the Stone", "author": "Arthurian Legends", "level": "A1", "keyword": "young-arthur-pulling-sword-from-stone-castle"},
    {"id": "mythology_romulus_remus", "title": "Romulus and Remus: Founding Rome", "author": "Roman Mythology", "level": "A1", "keyword": "twin-babies-wolf-den-ancient-rome"},
    {"id": "mythology_isis_osiris", "title": "Isis and Osiris", "author": "Egyptian Mythology", "level": "A1", "keyword": "egyptian-goddess-isis-osiris-gold-throne"},
    {"id": "mythology_perseus_medusa", "title": "Perseus and the Gorgon Medusa", "author": "Greek Mythology", "level": "A1", "keyword": "perseus-knight-mirror-shield-medusa-snakes"},
    {"id": "mythology_jason_fleece", "title": "Jason and the Golden Fleece", "author": "Greek Mythology", "level": "A1", "keyword": "jason-argonauts-holding-golden-fleece-dragon"},
    {"id": "mythology_minotaur_labyrinth", "title": "Theseus and the Minotaur's Labyrinth", "author": "Greek Mythology", "level": "A1", "keyword": "theseus-sword-fight-minotaur-labyrinth-maze"},
    {"id": "mythology_robin_hood_sheriff", "title": "Robin Hood and the Golden Arrow", "author": "English Folklore", "level": "A1", "keyword": "robin-hood-archer-green-suit-shooting-arrow"},

    # A2 Level (15 Stories)
    {"id": "mythology_cupid_psyche", "title": "Cupid and Psyche", "author": "Roman Mythology", "level": "A2", "keyword": "angel-cupid-wings-psyche-palace-candles"},
    {"id": "mythology_trojan_horse", "title": "The Legend of the Trojan Horse", "author": "Greek Mythology", "level": "A2", "keyword": "wooden-trojan-horse-gates-troy-night"},
    {"id": "mythology_narcissus_echo", "title": "Narcissus and the Water Reflection", "author": "Greek Mythology", "level": "A2", "keyword": "handsome-narcissus-staring-pool-reflection-forest"},
    {"id": "mythology_prometheus_fire", "title": "Prometheus Steals the Fire", "author": "Greek Mythology", "level": "A2", "keyword": "prometheus-holding-glowing-fire-torch-mountains"},
    {"id": "mythology_orpheus_eurydice", "title": "Orpheus and His Golden Lyre", "author": "Greek Mythology", "level": "A2", "keyword": "orpheus-playing-harp-underworld-glowing-mist"},
    {"id": "mythology_apollo_daphne", "title": "Apollo and the Laurel Tree", "author": "Greek Mythology", "level": "A2", "keyword": "apollo-god-laurel-tree-turning-nymph"},
    {"id": "mythology_odin_eye", "title": "Odin and the Well of Wisdom", "author": "Norse Legends", "level": "A2", "keyword": "odin-one-eye-drinking-magic-well-crows"},
    {"id": "mythology_loki_prank", "title": "Loki and the Mistletoe Prank", "author": "Norse Legends", "level": "A2", "keyword": "mischievous-loki-viking-horns-magic-prank"},
    {"id": "mythology_sigurd_fafnir", "title": "Sigurd and the Golden Dragon Fafnir", "author": "Norse Legends", "level": "A2", "keyword": "sigurd-knight-sword-slaying-dragon-gold-hoard"},
    {"id": "mythology_gilgamesh_enkidu", "title": "Gilgamesh and Enkidu the Forest Man", "author": "Babylonian Epic", "level": "A2", "keyword": "king-gilgamesh-wild-man-enkidu-handshake"},
    {"id": "mythology_rama_sita", "title": "Rama and the Golden Deer", "author": "Indian Mythology", "level": "A2", "keyword": "prince-rama-bow-arrow-chasing-golden-deer"},
    {"id": "mythology_sphinx_riddle", "title": "Oedipus and the Riddle of the Sphinx", "author": "Greek Mythology", "level": "A2", "keyword": "sphinx-monster-wings-lion-riddle-canyon"},
    {"id": "mythology_legend_atlantis", "title": "The Myth of the Lost City of Atlantis", "author": "Plato's Legends", "level": "A2", "keyword": "underwater-city-atlantis-temples-domes-fishes"},
    {"id": "mythology_pygmalion_galatea", "title": "Pygmalion and the Ivory Statue", "author": "Greek Mythology", "level": "A2", "keyword": "sculptor-pygmalion-statue-coming-alive-studio"},
    {"id": "mythology_midas_ears", "title": "King Midas and the Donkey Ears", "author": "Greek Mythology", "level": "A2", "keyword": "king-midas-donkey-ears-crown-hiding"},

    # B1 Level (10 Stories)
    {"id": "mythology_bellerophon_chimera", "title": "Bellerophon and the Monster Chimera", "author": "Greek Mythology", "level": "B1", "keyword": "knight-riding-pegasus-spear-fighting-chimera"},
    {"id": "mythology_demeter_persephone", "title": "Demeter and the Cycle of Seasons", "author": "Greek Mythology", "level": "B1", "keyword": "goddess-demeter-wheat-plants-winter-snow"},
    {"id": "mythology_hercules_labors", "title": "The Twelve Labors of Hercules", "author": "Greek Mythology", "level": "B1", "keyword": "hercules-fighting-hydra-many-heads-dragon"},
    {"id": "mythology_theseus_ariadne", "title": "Theseus and the Thread of Ariadne", "author": "Greek Mythology", "level": "B1", "keyword": "ariadne-giving-ball-red-thread-theseus-labyrinth"},
    {"id": "mythology_judgment_paris", "title": "The Judgment of Paris and the Golden Apple", "author": "Greek Mythology", "level": "B1", "keyword": "prince-paris-three-goddesses-golden-apple"},
    {"id": "mythology_valhalla_valkyries", "title": "The Hall of Valhalla and the Valkyries", "author": "Norse Legends", "level": "B1", "keyword": "valkyrie-warrior-wings-flying-nordic-palace"},
    {"id": "mythology_baldur_death", "title": "The Tragedy of Baldur the Good", "author": "Norse Legends", "level": "B1", "keyword": "god-baldur-shining-light-mistletoe-arrow-tragedy"},
    {"id": "mythology_ganesha_head", "title": "Ganesha and the Elephant Head", "author": "Indian Mythology", "level": "B1", "keyword": "god-ganesha-elephant-head-sitting-lotus-flower"},
    {"id": "mythology_nuwa_sky", "title": "Nuwa Repairs the Pillars of Heaven", "author": "Chinese Mythology", "level": "B1", "keyword": "chinese-goddess-nuwa-colored-stones-repairing-sky"},
    {"id": "mythology_legend_eldorado", "title": "The Golden Legend of El Dorado", "author": "Muisca Folklore", "level": "B1", "keyword": "golden-king-raft-lake-andes-treasures"},

    # B2 Level (10 Stories)
    {"id": "mythology_iliad_war", "title": "The Trojan War and the Siege of Troy", "author": "Homer's Iliad", "level": "B2", "keyword": "achilles-hector-sword-fight-walls-troy"},
    {"id": "mythology_odyssey_journey", "title": "The Voyage of Odysseus: Trials at Sea", "author": "Homer's Odyssey", "level": "B2", "keyword": "odysseus-tied-to-ship-mast-sirens-cliffs"},
    {"id": "mythology_prometheus_theft", "title": "Prometheus and the Eternal Punishment", "author": "Greek Mythology", "level": "B2", "keyword": "prometheus-chained-rock-canyon-eagle-mountains"},
    {"id": "mythology_ragnarok_twilight", "title": "Ragnarok: The Twilight of the Gods", "author": "Norse Mythology", "level": "B2", "keyword": "gods-odin-thor-fighting-wolf-fenrir-fire-apocalypse"},
    {"id": "mythology_beowulf_grendel", "title": "Beowulf and the Swamp Monster Grendel", "author": "Anglo-Saxon Epic", "level": "B2", "keyword": "warrior-beowulf-ripping-arm-monster-grendel-hall"},
    {"id": "mythology_mahabharata_war", "title": "The Battle of Kurukshetra", "author": "The Mahabharata", "level": "B2", "keyword": "krishna-arjuna-chariot-battlefield-bow-arrow"},
    {"id": "mythology_sun_wukong_monkey", "title": "Sun Wukong: The Havoc in Heaven", "author": "Chinese Folklore", "level": "B2", "keyword": "monkey-king-sun-wukong-staff-cloud-palace-heaven"},
    {"id": "mythology_epic_gilgamesh", "title": "The Epic Quest for Immortality", "author": "Tablet of Gilgamesh", "level": "B2", "keyword": "gilgamesh-crossing-waters-death-boat-underworld"},
    {"id": "mythology_quetzalcoatl_serpent", "title": "Quetzalcoatl: The Feathered Serpent", "author": "Aztec Mythology", "level": "B2", "keyword": "feathered-serpent-quetzalcoatl-god-aztec-temple"},
    {"id": "mythology_osiris_resurrection", "title": "The Judgment of Anubis and Osiris", "author": "Egyptian Mythology", "level": "B2", "keyword": "anubis-jackal-weighing-heart-feather-egyptian-underworld"},

    # C1 Level (10 Stories)
    {"id": "mythology_aeneid_rome", "title": "The Aeneid: The Fate of Aeneas", "author": "Virgil's Epic", "level": "C1", "keyword": "aeneas-ship-burning-troy-journey-founding-rome"},
    {"id": "mythology_theban_oedipus", "title": "The Theban Cycle: The Tragedy of Oedipus", "author": "Sophocles", "level": "C1", "keyword": "blind-oedipus-exile-daughter-antigone-ancient-greece"},
    {"id": "mythology_myth_er_plato", "title": "The Myth of Er: Journey of Souls", "author": "Plato's Republic", "level": "C1", "keyword": "spindle-of-necessity-spinning-cosmos-souls-reincarnation"},
    {"id": "mythology_norse_creation", "title": "The Norse Creation: Yggdrasil", "author": "The Prose Edda", "level": "C1", "keyword": "giant-tree-yggdrasil-world-tree-branches-stars-roots"},
    {"id": "mythology_popol_vuh_maya", "title": "Popol Vuh: The Maya Hero Twins", "author": "Mayan Mythology", "level": "C1", "keyword": "maya-hero-twins-playing-ball-underworld-xibalba"},
    {"id": "mythology_legend_arthur", "title": "The Fall of Camelot and King Arthur", "author": "Thomas Malory", "level": "C1", "keyword": "king-arthur-dying-knights-round-table-lake-hand-sword"},
    {"id": "mythology_bhagavad_gita", "title": "The Bhagavad Gita: Dialogue of Arjuna", "author": "Indian Philosophy", "level": "C1", "keyword": "krishna-universal-form-cosmic-revelation-chariot"},
    {"id": "mythology_journey_west", "title": "The Journey to the West: Sacred Scrolls", "author": "Wu Cheng'en", "level": "C1", "keyword": "monk-xuanzang-monkey-king-pigsy-sandy-journey-west"},
    {"id": "mythology_egyptian_dead", "title": "The Book of the Dead: Spell of Passage", "author": "Ancient Egyptian Scrolls", "level": "C1", "keyword": "egyptian-mummy-tomb-papyrus-scroll-glowing-hieroglyphs"},
    {"id": "mythology_celtic_mabinogion", "title": "The Celtic Mabinogion: Four Branches", "author": "Celtic Folklore", "level": "C1", "keyword": "celtic-druid-forest-glowing-cauldron-magic-spells"}
]

DATA_FILE = "mythology_stories_data.json"

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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
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
                print("  Model gemini-2.5-flash error/not found. Trying gemini-flash-lite-latest...", flush=True)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
                req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
                time.sleep(5)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 15 seconds...", flush=True)
                time.sleep(15)
    return None

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Mythology stories...", flush=True)
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)", flush=True)
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...", flush=True)
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write mythological narratives and legends for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across exactly 6 parts. Crucial rule: The story events, mythological figures, and descriptions MUST strictly match classical myths about '{story['title']}' without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 6:
        print(f"  Generating Part {chapter}/6...", flush=True)
        prompt = f"Write Part {chapter} of the mythology story '{story['title']}' from '{story['author']}'. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 110-130 words in length to satisfy the 2000-2500 words total count. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the classical mythological events. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
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

print("\n--- Mythology Story Generation Phase Complete! ---", flush=True)
