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
    {"id": "detective_scandal_bohemia", "title": "A Scandal in Bohemia", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "detective_copper_beeches", "title": "The Adventure of the Copper Beeches", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "detective_blue_cross", "title": "The Blue Cross", "author": "G. K. Chesterton", "level": "A1"},
    {"id": "detective_queens_necklace", "title": "The Queen's Necklace", "author": "Maurice Leblanc", "level": "A1"},
    {"id": "detective_coin_dionysius", "title": "The Coin of Dionysius", "author": "Ernest Bramah", "level": "A1"},
    {"id": "detective_dancing_men", "title": "The Adventure of the Dancing Men", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "detective_red_silk_scarf", "title": "The Red Silk Scarf", "author": "Maurice Leblanc", "level": "A1"},
    {"id": "detective_queer_feet", "title": "The Queer Feet", "author": "G. K. Chesterton", "level": "A1"},
    {"id": "detective_lenton_croft", "title": "The Case of the Lenton Croft Robberies", "author": "Arthur Morrison", "level": "A1"},
    {"id": "detective_cell_13_part1", "title": "The Problem of Cell 13 - Part 1", "author": "Jacques Futrelle", "level": "A1"},

    # A2 Level (15 Stories)
    {"id": "detective_study_scarlet_1", "title": "A Study in Scarlet - Part 1", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_study_scarlet_2", "title": "A Study in Scarlet - Part 2", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_sign_four_1", "title": "The Sign of the Four - Part 1", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_sign_four_2", "title": "The Sign of the Four - Part 2", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_silver_blaze", "title": "Silver Blaze", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_arrest_lupin", "title": "The Arrest of Arsène Lupin", "author": "Maurice Leblanc", "level": "A2"},
    {"id": "detective_lupin_in_prison", "title": "Arsène Lupin in Prison", "author": "Maurice Leblanc", "level": "A2"},
    {"id": "detective_escape_lupin", "title": "The Escape of Arsène Lupin", "author": "Maurice Leblanc", "level": "A2"},
    {"id": "detective_mysterious_passenger", "title": "The Mysterious Passenger", "author": "Maurice Leblanc", "level": "A2"},
    {"id": "detective_flying_stars", "title": "The Flying Stars", "author": "G. K. Chesterton", "level": "A2"},
    {"id": "detective_sins_saradine", "title": "The Sins of Prince Saradine", "author": "G. K. Chesterton", "level": "A2"},
    {"id": "detective_biter_bit", "title": "The Biter Bit", "author": "Wilkie Collins", "level": "A2"},
    {"id": "detective_fenchurch_street", "title": "The Fenchurch Street Mystery", "author": "Baroness Orczy", "level": "A2"},
    {"id": "detective_cell_13_part2", "title": "The Problem of Cell 13 - Part 2", "author": "Jacques Futrelle", "level": "A2"},
    {"id": "detective_marie_roget", "title": "The Mystery of Marie Rogêt", "author": "Edgar Allan Poe", "level": "A2"},

    # B1 Level (13 Stories)
    {"id": "detective_hound_baskervilles_1", "title": "The Hound of the Baskervilles - Part 1", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_hound_baskervilles_2", "title": "The Hound of the Baskervilles - Part 2", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_valley_fear_1", "title": "The Valley of Fear - Part 1", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_valley_fear_2", "title": "The Valley of Fear - Part 2", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_musgrave_ritual", "title": "The Adventure of the Musgrave Ritual", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_final_problem", "title": "The Adventure of the Final Problem", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_empty_house", "title": "The Adventure of the Empty House", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_invisible_man", "title": "The Invisible Man", "author": "G. K. Chesterton", "level": "B1"},
    {"id": "detective_hammer_of_god", "title": "The Hammer of God", "author": "G. K. Chesterton", "level": "B1"},
    {"id": "detective_moonstone_1", "title": "The Moonstone - Part 1", "author": "Wilkie Collins", "level": "B1"},
    {"id": "detective_moonstone_2", "title": "The Moonstone - Part 2", "author": "Wilkie Collins", "level": "B1"},
    {"id": "detective_circular_staircase_1", "title": "The Circular Staircase - Part 1", "author": "Mary Roberts Rinehart", "level": "B1"},
    {"id": "detective_phantom_motor", "title": "The Phantom Motor", "author": "Jacques Futrelle", "level": "B1"},

    # B2 Level (9 Stories)
    {"id": "detective_woman_in_white_1", "title": "The Woman in White - Part 1", "author": "Wilkie Collins", "level": "B2"},
    {"id": "detective_woman_in_white_2", "title": "The Woman in White - Part 2", "author": "Wilkie Collins", "level": "B2"},
    {"id": "detective_yellow_room_1", "title": "The Mystery of the Yellow Room - Part 1", "author": "Gaston Leroux", "level": "B2"},
    {"id": "detective_yellow_room_2", "title": "The Mystery of the Yellow Room - Part 2", "author": "Gaston Leroux", "level": "B2"},
    {"id": "detective_lady_in_black", "title": "The Perfume of the Lady in Black", "author": "Gaston Leroux", "level": "B2"},
    {"id": "detective_holmes_too_late", "title": "Sherlock Holmes Arrives Too Late", "author": "Maurice Leblanc", "level": "B2"},
    {"id": "detective_laker_absconded", "title": "The Case of Laker, Absconded", "author": "Arthur Morrison", "level": "B2"},
    {"id": "detective_dublin_mystery", "title": "The Dublin Mystery", "author": "Baroness Orczy", "level": "B2"},
    {"id": "detective_crystal_gazer", "title": "The Crystal Gazer", "author": "Jacques Futrelle", "level": "B2"},

    # C1 Level (3 Stories)
    {"id": "detective_moonstone_revelation", "title": "The Moonstone - The Revelation", "author": "Wilkie Collins", "level": "C1"},
    {"id": "detective_double_life", "title": "The Double Life", "author": "Gaston Leroux", "level": "C1"},
    {"id": "detective_gold_bug_1", "title": "The Gold-Bug - Part 1", "author": "Edgar Allan Poe", "level": "C1"},

    # Additional 30 Stories:
    # A1 Level (10 Stories)
    {"id": "detective_noble_bachelor", "title": "The Adventure of the Noble Bachelor", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "detective_cardboard_box", "title": "The Adventure of the Cardboard Box", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "detective_mirror_magistrate", "title": "The Mirror of the Magistrate", "author": "G. K. Chesterton", "level": "A1"},
    {"id": "detective_seven_of_hearts", "title": "The Seven of Hearts", "author": "Maurice Leblanc", "level": "A1"},
    {"id": "detective_secret_growler", "title": "The Secret of the Growler", "author": "Arthur Morrison", "level": "A1"},
    {"id": "detective_lost_special", "title": "The Lost Special", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "detective_red_thread_honour", "title": "The Red Thread of Honour", "author": "Ernest Bramah", "level": "A1"},
    {"id": "detective_escape_old_man", "title": "The Escape of the Old Man", "author": "Baroness Orczy", "level": "A1"},
    {"id": "detective_case_mirror", "title": "The Case of the Mirror", "author": "Jacques Futrelle", "level": "A1"},
    {"id": "detective_steel_room", "title": "The Mystery of the Steel Room", "author": "Jacques Futrelle", "level": "A1"},

    # A2 Level (10 Stories)
    {"id": "detective_beryl_coronet", "title": "The Adventure of the Beryl Coronet", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_engineers_thumb", "title": "The Adventure of the Engineer's Thumb", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "detective_red_scarf_2", "title": "The Red Silk Scarf - Part 2", "author": "Maurice Leblanc", "level": "A2"},
    {"id": "detective_black_pearl", "title": "The Black Pearl", "author": "Maurice Leblanc", "level": "A2"},
    {"id": "detective_man_passage", "title": "The Man in the Passage", "author": "G. K. Chesterton", "level": "A2"},
    {"id": "detective_purple_jewel", "title": "The Purple Jewel", "author": "G. K. Chesterton", "level": "A2"},
    {"id": "detective_hansom_cab_1", "title": "The Mystery of the Hansom Cab - Part 1", "author": "Fergus Hume", "level": "A2"},
    {"id": "detective_missing_hand", "title": "The Case of the Missing Hand", "author": "Arthur Morrison", "level": "A2"},
    {"id": "detective_stolen_cigar", "title": "The Stolen Cigar Case", "author": "Bret Harte", "level": "A2"},
    {"id": "detective_brook_street_tragedy", "title": "The Tragedy of Brook Street", "author": "Arthur Morrison", "level": "A2"},

    # B1 Level (10 Stories)
    {"id": "detective_crooked_man", "title": "The Adventure of the Crooked Man", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_naval_treaty", "title": "The Adventure of the Naval Treaty", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_norwood_builder", "title": "The Adventure of the Norwood Builder", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_three_students", "title": "The Adventure of the Three Students", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "detective_doom_griffiths", "title": "The Doom of the Griffiths", "author": "Elizabeth Gaskell", "level": "B1"},
    {"id": "detective_moonstone_investigation", "title": "The Moonstone - The Investigation", "author": "Wilkie Collins", "level": "B1"},
    {"id": "detective_woman_white_conspiracy", "title": "The Woman in White - The Conspiracy", "author": "Wilkie Collins", "level": "B1"},
    {"id": "detective_hansom_cab_2", "title": "The Mystery of the Hansom Cab - Part 2", "author": "Fergus Hume", "level": "B1"},
    {"id": "detective_red_house_1", "title": "The Red House Mystery - Part 1", "author": "A. A. Milne", "level": "B1"},
    {"id": "detective_red_house_2", "title": "The Red House Mystery - Part 2", "author": "A. A. Milne", "level": "B1"}
]

DATA_FILE = "detective_stories_data.json"

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
                print("  Model gemini-flash-lite-latest error. Trying gemini-1.5-flash...", flush=True)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
                time.sleep(5)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 15 seconds...", flush=True)
                time.sleep(15)
    return None

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Detective stories...", flush=True)
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)", flush=True)
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...", flush=True)
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional detective and mystery fiction author and language teacher. You write classic detective stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications, making it highly engaging and suitable for adults."
    
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
        time.sleep(15) # 15 seconds delay between chapters
            
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
        
    time.sleep(20) # 20 seconds delay between stories


print("Detective story generation completed!", flush=True)
