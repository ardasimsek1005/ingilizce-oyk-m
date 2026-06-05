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
    # A1 Level (10 Stories)
    {"id": "scifi_time_machine", "title": "The Time Machine", "author": "H. G. Wells", "level": "A1"},
    {"id": "scifi_journey_center_earth", "title": "A Journey to the Centre of the Earth", "author": "Jules Verne", "level": "A1"},
    {"id": "scifi_twenty_thousand_leagues", "title": "Twenty Thousand Leagues Under the Sea", "author": "Jules Verne", "level": "A1"},
    {"id": "scifi_robie", "title": "Robbie", "author": "Isaac Asimov", "level": "A1"},
    {"id": "scifi_runaround", "title": "Runaround", "author": "Isaac Asimov", "level": "A1"},
    {"id": "scifi_star_beast", "title": "The Star Beast", "author": "Robert A. Heinlein", "level": "A1"},
    {"id": "scifi_lost_world", "title": "The Lost World", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "scifi_from_earth_to_moon", "title": "From the Earth to the Moon", "author": "Jules Verne", "level": "A1"},
    {"id": "scifi_propeller_island", "title": "Propeller Island", "author": "Jules Verne", "level": "A1"},
    {"id": "scifi_star_maker", "title": "Star Maker", "author": "Olaf Stapledon", "level": "A1"},

    # A2 Level (15 Stories)
    {"id": "scifi_invisible_man", "title": "The Invisible Man", "author": "H. G. Wells", "level": "A2"},
    {"id": "scifi_war_worlds", "title": "The War of the Worlds", "author": "H. G. Wells", "level": "A2"},
    {"id": "scifi_frankenstein", "title": "Frankenstein", "author": "Mary Shelley", "level": "A2"},
    {"id": "scifi_island_dr_moreau", "title": "The Island of Doctor Moreau", "author": "H. G. Wells", "level": "A2"},
    {"id": "scifi_first_men_moon", "title": "The First Men in the Moon", "author": "H. G. Wells", "level": "A2"},
    {"id": "scifi_around_moon", "title": "Around the Moon", "author": "Jules Verne", "level": "A2"},
    {"id": "scifi_youth", "title": "Youth", "author": "Isaac Asimov", "level": "A2"},
    {"id": "scifi_reason", "title": "Reason", "author": "Isaac Asimov", "level": "A2"},
    {"id": "scifi_food_of_gods", "title": "The Food of the Gods", "author": "H. G. Wells", "level": "A2"},
    {"id": "scifi_chocky", "title": "Chocky", "author": "John Wyndham", "level": "A2"},
    {"id": "scifi_wells_star", "title": "The Star", "author": "H. G. Wells", "level": "A2"},
    {"id": "scifi_new_hope", "title": "Star Wars: A New Hope", "author": "George Lucas", "level": "A2"},
    {"id": "scifi_liar", "title": "Liar!", "author": "Isaac Asimov", "level": "A2"},
    {"id": "scifi_strange_case_dr_jekyll", "title": "Strange Case of Dr Jekyll and Mr Hyde", "author": "Robert Louis Stevenson", "level": "A2"},
    {"id": "scifi_the_chrysalids", "title": "The Chrysalids", "author": "John Wyndham", "level": "A2"},

    # B1 Level (13 Stories)
    {"id": "scifi_i_robot", "title": "I, Robot", "author": "Isaac Asimov", "level": "B1"},
    {"id": "scifi_nightfall", "title": "Nightfall", "author": "Isaac Asimov", "level": "B1"},
    {"id": "scifi_sentinel", "title": "The Sentinel", "author": "Arthur C. Clarke", "level": "B1"},
    {"id": "scifi_nine_billion_names", "title": "The Nine Billion Names of God", "author": "Arthur C. Clarke", "level": "B1"},
    {"id": "scifi_sound_of_thunder", "title": "A Sound of Thunder", "author": "Ray Bradbury", "level": "B1"},
    {"id": "scifi_martian_chronicles", "title": "The Martian Chronicles", "author": "Ray Bradbury", "level": "B1"},
    {"id": "scifi_veldt", "title": "The Veldt", "author": "Ray Bradbury", "level": "B1"},
    {"id": "scifi_soft_rains", "title": "There Will Come Soft Rains", "author": "Ray Bradbury", "level": "B1"},
    {"id": "scifi_arena", "title": "Arena", "author": "Fredric Brown", "level": "B1"},
    {"id": "scifi_expedition", "title": "Expedition", "author": "Fredric Brown", "level": "B1"},
    {"id": "scifi_escape_velocity", "title": "Escape Velocity", "author": "Unknown", "level": "B1"},
    {"id": "scifi_evidence", "title": "Evidence", "author": "Isaac Asimov", "level": "B1"},
    {"id": "scifi_clarke_star", "title": "The Star", "author": "Arthur C. Clarke", "level": "B1"},

    # B2 Level (9 Stories)
    {"id": "scifi_do_androids_dream", "title": "Do Androids Dream of Electric Sheep?", "author": "Philip K. Dick", "level": "B2"},
    {"id": "scifi_minority_report", "title": "The Minority Report", "author": "Philip K. Dick", "level": "B2"},
    {"id": "scifi_total_recall", "title": "We Can Remember It for You Wholesale", "author": "Philip K. Dick", "level": "B2"},
    {"id": "scifi_time_patrol", "title": "Time Patrol", "author": "Poul Anderson", "level": "B2"},
    {"id": "scifi_day_of_triffids", "title": "The Day of the Triffids", "author": "John Wyndham", "level": "B2"},
    {"id": "scifi_midwich_cuckoos", "title": "The Midwich Cuckoos", "author": "John Wyndham", "level": "B2"},
    {"id": "scifi_cold_equations", "title": "The Cold Equations", "author": "Tom Godwin", "level": "B2"},
    {"id": "scifi_bicentennial_man", "title": "The Bicentennial Man", "author": "Isaac Asimov", "level": "B2"},
    {"id": "scifi_last_question", "title": "The Last Question", "author": "Isaac Asimov", "level": "B2"},

    # C1 Level (3 Stories)
    {"id": "scifi_machine_stops", "title": "The Machine Stops", "author": "E. M. Forster", "level": "C1"},
    {"id": "scifi_solitude", "title": "Solitude", "author": "Ursula K. Le Guin", "level": "C1"},
    {"id": "scifi_by_waters_of_babylon", "title": "By the Waters of Babylon", "author": "Stephen Vincent Benét", "level": "C1"}
]

DATA_FILE = "scifi_stories_data.json"

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
                        "description": "3 paragraphs of the story in English, about 130-170 words each"
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
            with urllib.request.urlopen(req, timeout=25) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content.strip())
        except Exception as e:
            err_str = str(e)
            if "429" in err_str:
                print(f"  Rate limited (429). Sleeping for 60 seconds (Attempt {attempt + 1}/5)...", flush=True)
                time.sleep(60)
            elif "404" in err_str or "model" in err_str.lower():
                # Fallback model if 2.0-flash is not available on this key
                print("  Model gemini-2.0-flash not found or error. Trying gemini-1.5-flash...", flush=True)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
                time.sleep(5)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 15 seconds...", flush=True)
                time.sleep(15)
    return None

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Science Fiction stories...", flush=True)
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)", flush=True)
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...", flush=True)
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional science fiction author and language teacher. You write classic and philosophical sci-fi stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications, making it highly engaging and suitable for adults."
    
    success = True
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...", flush=True)
        prompt = f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 130-170 words in length to hit the overall 2000-2500 word limit. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the original classic plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 90 seconds before retrying this part...", flush=True)
            time.sleep(90)
            continue
            
        def clean_p(p):
            # Clean prefixes like "Chapter 1", "Capture X", "Bölüm X"
            pattern = r"^\s*(?:chapter|capture|bölüm|part|section)\s+(?:[0-9]+|[ivxldm]+)\b[:\-\s\.]*"
            cleaned = re.sub(pattern, "", p, flags=re.IGNORECASE).strip()
            if re.match(r"^\s*(?:chapter|capture|bölüm|part|section)\s*(?:[0-9]+|[ivxldm]+)?\s*$", cleaned, re.IGNORECASE):
                return ""
            return cleaned

        cleaned_en = [clean_p(p) for p in result["english_paragraphs"]]
        cleaned_en = [p for p in cleaned_en if p]

        cleaned_tr = [clean_p(p) for p in result["turkish_paragraphs"]]
        cleaned_tr = [p for p in cleaned_tr if p]

        if len(cleaned_en) != len(cleaned_tr):
            print(f"  Warning: Paragraph count mismatch (EN: {len(cleaned_en)}, TR: {len(cleaned_tr)}). Retrying this part...", flush=True)
            time.sleep(5)
            continue

        story_en_paragraphs.extend(cleaned_en)
        story_tr_paragraphs.extend(cleaned_tr)
        
        for w in result["vocabulary"]:
            en_word = w["en"].strip().lower()
            tr_word = w["tr"].strip()
            if en_word and tr_word:
                story_words[en_word] = tr_word
                
        chapter += 1
        time.sleep(3) # 3 seconds delay between chapters
            
    # Save the story and run vocabulary refiner for CEFR compliance
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
    print(f"  Success! Total paragraphs: {len(story_en_paragraphs)}, words: {word_count}, dictionary: {len(story_words)} words.", flush=True)
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(2)

print("Science Fiction story generation completed!", flush=True)
