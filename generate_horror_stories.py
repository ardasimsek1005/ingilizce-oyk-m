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
    # A1 Seviyesi (10 Eser)
    {"id": "horror_black_cat", "title": "The Black Cat", "author": "Edgar Allan Poe", "level": "A1"},
    {"id": "horror_signalman", "title": "The Signalman", "author": "Charles Dickens", "level": "A1"},
    {"id": "horror_red_headed_league", "title": "The Red-Headed League", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "horror_blue_carbuncle", "title": "The Blue Carbuncle", "author": "Arthur Conan Doyle", "level": "A1"},
    {"id": "horror_young_goodman_brown", "title": "Young Goodman Brown", "author": "Nathaniel Hawthorne", "level": "A1"},
    {"id": "horror_phantom_rickshaw", "title": "The Phantom Rickshaw", "author": "Rudyard Kipling", "level": "A1"},
    {"id": "horror_draculas_guest", "title": "Dracula's Guest", "author": "Bram Stoker", "level": "A1"},
    {"id": "horror_devil_tom_walker", "title": "The Devil and Tom Walker", "author": "Washington Irving", "level": "A1"},
    {"id": "horror_monkeys_paw", "title": "The Monkey's Paw", "author": "W. W. Jacobs", "level": "A1"},
    {"id": "horror_oval_portrait", "title": "The Oval Portrait", "author": "Edgar Allan Poe", "level": "A1"},

    # A2 Seviyesi (15 Eser)
    {"id": "horror_house_of_usher", "title": "The Fall of the House of Usher", "author": "Edgar Allan Poe", "level": "A2"},
    {"id": "horror_cask_amontillado", "title": "The Cask of Amontillado", "author": "Edgar Allan Poe", "level": "A2"},
    {"id": "horror_speckled_band", "title": "The Speckled Band", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "horror_yellow_wallpaper", "title": "The Yellow Wallpaper", "author": "Charlotte Perkins Gilman", "level": "A2"},
    {"id": "horror_willows", "title": "The Willows", "author": "Algernon Blackwood", "level": "A2"},
    {"id": "horror_wendigo", "title": "The Wendigo", "author": "Algernon Blackwood", "level": "A2"},
    {"id": "horror_king_in_yellow", "title": "The King in Yellow", "author": "Robert W. Chambers", "level": "A2"},
    {"id": "horror_vampyre", "title": "The Vampyre", "author": "John William Polidori", "level": "A2"},
    {"id": "horror_horla", "title": "The Horla", "author": "Guy de Maupassant", "level": "A2"},
    {"id": "horror_green_tea", "title": "Green Tea", "author": "Sheridan Le Fanu", "level": "A2"},
    {"id": "horror_sandman", "title": "The Sandman", "author": "E. T. A. Hoffmann", "level": "A2"},
    {"id": "horror_birth_mark", "title": "The Birth-Mark", "author": "Nathaniel Hawthorne", "level": "A2"},
    {"id": "horror_masque_red_death", "title": "The Masque of the Red Death", "author": "Edgar Allan Poe", "level": "A2"},
    {"id": "horror_gold_bug", "title": "The Gold-Bug", "author": "Edgar Allan Poe", "level": "A2"},
    {"id": "horror_moonstone", "title": "The Moonstone", "author": "Wilkie Collins", "level": "A2"},

    # B1 Seviyesi (10 Eser)
    {"id": "horror_pit_pendulum", "title": "The Pit and the Pendulum", "author": "Edgar Allan Poe", "level": "B1"},
    {"id": "horror_tell_tale_heart", "title": "The Tell-Tale Heart", "author": "Edgar Allan Poe", "level": "B1"},
    {"id": "horror_murders_rue_morgue", "title": "The Murders in the Rue Morgue", "author": "Edgar Allan Poe", "level": "B1"},
    {"id": "horror_boscombe_valley", "title": "The Boscombe Valley Mystery", "author": "Arthur Conan Doyle", "level": "B1"},
    {"id": "horror_woman_in_white", "title": "The Woman in White", "author": "Wilkie Collins", "level": "B1"},
    {"id": "horror_phantom_opera", "title": "The Phantom of the Opera", "author": "Gaston Leroux", "level": "B1"},
    {"id": "horror_dunwich_horror", "title": "The Dunwich Horror", "author": "H. P. Lovecraft", "level": "B1"},
    {"id": "horror_mountains_madness", "title": "At the Mountains of Madness", "author": "H. P. Lovecraft", "level": "B1"},
    {"id": "horror_shadow_innsmouth", "title": "The Shadow over Innsmouth", "author": "H. P. Lovecraft", "level": "B1"},
    {"id": "horror_carmilla", "title": "Carmilla", "author": "Sheridan Le Fanu", "level": "B1"},

    # B2 Seviyesi (10 Eser)
    {"id": "horror_hound_baskervilles", "title": "The Hound of the Baskervilles", "author": "Arthur Conan Doyle", "level": "B2"},
    {"id": "horror_lair_white_worm", "title": "The Lair of the White Worm", "author": "Bram Stoker", "level": "B2"},
    {"id": "horror_jewel_seven_stars", "title": "The Jewel of Seven Stars", "author": "Bram Stoker", "level": "B2"},
    {"id": "horror_turn_of_screw", "title": "The Turn of the Screw", "author": "Henry James", "level": "B2"},
    {"id": "horror_rappaccinis_daughter", "title": "Rappaccini's Daughter", "author": "Nathaniel Hawthorne", "level": "B2"},
    {"id": "horror_mysteries_udolpho", "title": "The Mysteries of Udolpho", "author": "Ann Radcliffe", "level": "B2"},
    {"id": "horror_castle_of_otranto", "title": "The Castle of Otranto", "author": "Horace Walpole", "level": "B2"},
    {"id": "horror_monk", "title": "The Monk", "author": "Matthew Gregory Lewis", "level": "B2"},
    {"id": "horror_purloined_letter", "title": "The Purloined Letter", "author": "Edgar Allan Poe", "level": "B2"},
    {"id": "horror_great_god_pan", "title": "The Great God Pan", "author": "Arthur Machen", "level": "B2"},

    # C1 Seviyesi (5 Eser)
    {"id": "horror_call_of_cthulhu", "title": "The Call of Cthulhu", "author": "H. P. Lovecraft", "level": "C1"},
    {"id": "horror_white_people", "title": "The White People", "author": "Arthur Machen", "level": "C1"},
    {"id": "horror_beetle", "title": "The Beetle", "author": "Richard Marsh", "level": "C1"},
    {"id": "horror_house_borderland", "title": "The House on the Borderland", "author": "William Hope Hodgson", "level": "C1"},
    {"id": "horror_varney_vampire", "title": "Varney the Vampire", "author": "Thomas Preskett Prest", "level": "C1"}
]

DATA_FILE = "horror_stories_data.json"

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
                        "description": "3 paragraphs of the story in English, about 100-150 words each"
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
                        "description": "5-8 key vocabulary words extracted from this chapter"
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
                print(f"  Rate limited (429). Sleeping for 60 seconds (Attempt {attempt + 1}/5)...")
                time.sleep(60)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 15 seconds...")
                time.sleep(15)
    return None

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Horror & Mystery stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)")
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write gothic/horror/mystery stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 1500 to 2000 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...")
        prompt = f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 100-150 words in length. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the original classic plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            # Full failure (probably rate limit)
            print("  Persistent rate limit or error encountered. Sleeping for 180 seconds (3 minutes) before retrying this part...")
            time.sleep(180)
            continue
            
        def clean_p(p):
            # Clean prefixes like "Chapter 1", "Capture X", "Bölüm X"
            pattern = r"^\s*(?:chapter|capture|bölüm|part|section)\s+(?:[0-9]+|[ivxldm]+)\b[:\-\s\.]*"
            cleaned = re.sub(pattern, "", p, flags=re.IGNORECASE).strip()
            # If paragraph is just the chapter/part label, ignore it
            if re.match(r"^\s*(?:chapter|capture|bölüm|part|section)\s*(?:[0-9]+|[ivxldm]+)?\s*$", cleaned, re.IGNORECASE):
                return ""
            return cleaned

        cleaned_en = [clean_p(p) for p in result["english_paragraphs"]]
        cleaned_en = [p for p in cleaned_en if p]

        cleaned_tr = [clean_p(p) for p in result["turkish_paragraphs"]]
        cleaned_tr = [p for p in cleaned_tr if p]

        # Check alignment
        if len(cleaned_en) != len(cleaned_tr):
            print(f"  Warning: Paragraph count mismatch (EN: {len(cleaned_en)}, TR: {len(cleaned_tr)}). Retrying this part...")
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
        time.sleep(4) # 4 seconds delay between chapters
            
    # Save the story
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
    print(f"  Success! Total paragraphs: {len(story_en_paragraphs)}, words: {word_count}, dictionary: {len(story_words)} words.")
    
    # Save progress instantly
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(3)

print("Story generation completed!")
