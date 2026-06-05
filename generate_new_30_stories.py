from generator_refiner import refine_story
import os
import json
import time
import urllib.request
import urllib.parse
import re

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
    # --- Fables & Kids (10 Stories - A1) ---
    {"id": "fable_shepherd_flute", "title": "The Shepherd's Flute", "author": "Traditional", "level": "A1"},
    {"id": "fable_ant_dove", "title": "The Ant and the Dove", "author": "Aesop", "level": "A1"},
    {"id": "fable_donkey_salt", "title": "The Donkey and the Salt", "author": "Aesop", "level": "A1"},
    {"id": "fable_honest_woodcutter", "title": "The Honest Woodcutter", "author": "Aesop", "level": "A1"},
    {"id": "fable_milkmaid_pail", "title": "The Milkmaid and her Pail", "author": "Aesop", "level": "A1"},
    {"id": "fable_peacock_crane", "title": "The Peacock and the Crane", "author": "Aesop", "level": "A1"},
    {"id": "fable_fisherman_fish", "title": "The Fisherman and the Little Fish", "author": "Aesop", "level": "A1"},
    {"id": "fable_three_wishes", "title": "The Three Wishes", "author": "Traditional", "level": "A1"},
    {"id": "fable_magic_seed", "title": "The Magic Seed", "author": "Traditional", "level": "A1"},
    {"id": "fable_magic_paintbrush", "title": "The Magic Paintbrush", "author": "Chinese Folktale", "level": "A1"},

    # --- Horror & Mystery (10 Stories - A1/A2) ---
    {"id": "horror_ghost_library", "title": "The Ghost in the Library", "author": "Traditional", "level": "A1"},
    {"id": "horror_whispering_castle", "title": "The Whispering Castle", "author": "Traditional", "level": "A2"},
    {"id": "horror_haunted_lighthouse", "title": "The Haunted Lighthouse", "author": "Traditional", "level": "A2"},
    {"id": "horror_clock_tower_ghost", "title": "The Clock Tower Ghost", "author": "Traditional", "level": "A2"},
    {"id": "horror_haunted_mirror", "title": "The Haunted Mirror", "author": "Traditional", "level": "A2"},
    {"id": "horror_whispering_shadows", "title": "The Whispering Shadows", "author": "Traditional", "level": "A1"},
    {"id": "horror_crying_stone", "title": "The Legend of the Crying Stone", "author": "Traditional", "level": "A2"},
    {"id": "horror_haunted_painting", "title": "The Haunted Painting", "author": "Traditional", "level": "A2"},
    {"id": "horror_haunted_clock", "title": "The Haunted Clock", "author": "Traditional", "level": "A2"},
    {"id": "horror_mysterious_passenger", "title": "The Mysterious Passenger", "author": "Traditional", "level": "A2"},

    # --- Classics & Adventure (10 Stories - A1/A2) ---
    {"id": "classic_gulliver_laputa", "title": "Gulliver's Travels - The Floating Island", "author": "Jonathan Swift", "level": "A2"},
    {"id": "classic_crusoe_footprint", "title": "Robinson Crusoe - The First Footprint", "author": "Daniel Defoe", "level": "A1"},
    {"id": "classic_call_wild_race", "title": "The Call of the Wild - The Great Sled Race", "author": "Jack London", "level": "A2"},
    {"id": "classic_around_world_india", "title": "Around the World in Eighty Days - The Train in India", "author": "Jules Verne", "level": "A2"},
    {"id": "classic_treasure_island_chest", "title": "Treasure Island - The Map in the Chest", "author": "Robert Louis Stevenson", "level": "A1"},
    {"id": "classic_moby_dick_whale", "title": "Moby Dick - The White Whale", "author": "Herman Melville", "level": "A2"},
    {"id": "classic_secret_garden_key", "title": "The Secret Garden - The Locked Gate", "author": "Frances Hodgson Burnett", "level": "A1"},
    {"id": "classic_heidi_mountain", "title": "Heidi - The Grandfather's House", "author": "Johanna Spyri", "level": "A1"},
    {"id": "classic_don_quixote_windmills", "title": "Don Quixote - The Windmills", "author": "Miguel de Cervantes", "level": "A1"},
    {"id": "classic_odyssey_sirens", "title": "The Odyssey - The Sirens' Song", "author": "Homer", "level": "A2"}
]

DATA_FILE = "new_30_stories_data.json"

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
                        "description": "3 paragraphs of the story in English, about 100-180 words each"
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
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content.strip())
        except Exception as e:
            err_str = str(e)
            if "429" in err_str:
                print(f"  Rate limited (429). Sleeping for 45 seconds (Attempt {attempt + 1}/5)...")
                time.sleep(45)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 10 seconds...")
                time.sleep(10)
    return None

print(f"Starting/resuming generation of 30 new A1-A2 stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/30] Skipping {story['title']} (Already generated)")
        continue
        
    print(f"[{idx+1}/30] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    if story["level"] == "A1":
        level_guidelines = "Ensure the grammar and vocabulary are extremely simple, suitable for absolute beginners (CEFR A1 level). Use simple present tense, basic sentences, and high-frequency everyday vocabulary. Avoid complex clauses or advanced idioms."
    else: # A2
        level_guidelines = "Ensure the grammar and vocabulary are simple, suitable for CEFR A2 elementary level language learners. Use basic sentence structures, everyday language, and simple past or present tenses."

    sys_instruction = f"You are a professional literary author and language teacher. You write stories for English learners at the CEFR {story['level']} level. {level_guidelines} Your target word count for the entire story is 2000 to 2500 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST match the classic story of '{story['title']}' by {story['author']}."
    
    success = True
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...")
        prompt = f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 130-180 words in length. {level_guidelines} Keep the story matched to the original plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 90 seconds before retrying this part...")
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
        time.sleep(3) # delay to avoid rate limits
            
    # Save the story
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
    
    word_count = sum(len(p.split()) for p in story_en_paragraphs)
    print(f"  Success! Total paragraphs: {len(story_en_paragraphs)}, words: {word_count}, dictionary: {len(story_words)} words.")
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(3)

print("Story generation completed successfully!")
