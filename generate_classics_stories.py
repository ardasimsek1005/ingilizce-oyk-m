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
    # A1 Seviyesi (10 Eser)
    {"id": "classic_tom_sawyer", "title": "The Adventures of Tom Sawyer", "author": "Mark Twain", "level": "A1"},
    {"id": "classic_oliver_twist", "title": "Oliver Twist", "author": "Charles Dickens", "level": "A1"},
    {"id": "classic_prince_pauper", "title": "The Prince and the Pauper", "author": "Mark Twain", "level": "A1"},
    {"id": "classic_kidnapped", "title": "Kidnapped", "author": "Robert Louis Stevenson", "level": "A1"},
    {"id": "classic_three_musketeers", "title": "The Three Musketeers", "author": "Alexandre Dumas", "level": "A1"},
    {"id": "classic_uncle_tom_cabin", "title": "Uncle Tom's Cabin", "author": "Harriet Beecher Stowe", "level": "A1"},
    {"id": "classic_journey_center_earth", "title": "Journey to the Center of the Earth", "author": "Jules Verne", "level": "A1"},
    {"id": "classic_first_men_moon", "title": "The First Men in the Moon", "author": "H. G. Wells", "level": "A1"},
    {"id": "classic_captains_courageous", "title": "Captains Courageous", "author": "Rudyard Kipling", "level": "A1"},
    {"id": "classic_mysterious_island", "title": "The Mysterious Island", "author": "Jules Verne", "level": "A1"},

    # A2 Seviyesi (15 Eser)
    {"id": "classic_david_copperfield", "title": "David Copperfield", "author": "Charles Dickens", "level": "A2"},
    {"id": "classic_great_expectations", "title": "Great Expectations", "author": "Charles Dickens", "level": "A2"},
    {"id": "classic_jane_eyre", "title": "Jane Eyre", "author": "Charlotte Brontë", "level": "A2"},
    {"id": "classic_count_monte_cristo", "title": "The Count of Monte Cristo", "author": "Alexandre Dumas", "level": "A2"},
    {"id": "classic_huck_finn", "title": "Adventures of Huckleberry Finn", "author": "Mark Twain", "level": "A2"},
    {"id": "classic_twenty_thousand_leagues", "title": "Twenty Thousand Leagues Under the Seas", "author": "Jules Verne", "level": "A2"},
    {"id": "classic_earth_to_moon", "title": "From the Earth to the Moon", "author": "Jules Verne", "level": "A2"},
    {"id": "classic_lost_world", "title": "The Lost World", "author": "Arthur Conan Doyle", "level": "A2"},
    {"id": "classic_island_moreau", "title": "The Island of Doctor Moreau", "author": "H. G. Wells", "level": "A2"},
    {"id": "classic_red_badge_courage", "title": "The Red Badge of Courage", "author": "Stephen Crane", "level": "A2"},
    {"id": "classic_emma", "title": "Emma", "author": "Jane Austen", "level": "A2"},
    {"id": "classic_sense_sensibility", "title": "Sense and Sensibility", "author": "Jane Austen", "level": "A2"},
    {"id": "classic_mansfield_park", "title": "Mansfield Park", "author": "Jane Austen", "level": "A2"},
    {"id": "classic_persuasion", "title": "Persuasion", "author": "Jane Austen", "level": "A2"},
    {"id": "classic_northanger_abbey", "title": "Northanger Abbey", "author": "Jane Austen", "level": "A2"},

    # B1 Seviyesi (10 Eser)
    {"id": "classic_wuthering_heights", "title": "Wuthering Heights", "author": "Emily Brontë", "level": "B1"},
    {"id": "classic_scarlet_letter", "title": "The Scarlet Letter", "author": "Nathaniel Hawthorne", "level": "B1"},
    {"id": "classic_tale_two_cities", "title": "A Tale of Two Cities", "author": "Charles Dickens", "level": "B1"},
    {"id": "classic_man_iron_mask", "title": "The Man in the Iron Mask", "author": "Alexandre Dumas", "level": "B1"},
    {"id": "classic_connecticut_yankee", "title": "A Connecticut Yankee in King Arthur's Court", "author": "Mark Twain", "level": "B1"},
    {"id": "classic_age_of_innocence", "title": "The Age of Innocence", "author": "Edith Wharton", "level": "B1"},
    {"id": "classic_house_of_mirth", "title": "The House of Mirth", "author": "Edith Wharton", "level": "B1"},
    {"id": "classic_sea_wolf", "title": "The Sea-Wolf", "author": "Jack London", "level": "B1"},
    {"id": "classic_martin_eden", "title": "Martin Eden", "author": "Jack London", "level": "B1"},
    {"id": "classic_madding_crowd", "title": "Far from the Madding Crowd", "author": "Thomas Hardy", "level": "B1"},

    # B2 Seviyesi (10 Eser)
    {"id": "classic_fathers_and_sons", "title": "Fathers and Sons", "author": "Ivan Turgenev", "level": "B2"},
    {"id": "classic_dead_souls", "title": "Dead Souls", "author": "Nikolai Gogol", "level": "B2"},
    {"id": "classic_overcoat", "title": "The Overcoat", "author": "Nikolai Gogol", "level": "B2"},
    {"id": "classic_tess_urbervilles", "title": "Tess of the d'Urbervilles", "author": "Thomas Hardy", "level": "B2"},
    {"id": "classic_mayor_casterbridge", "title": "The Mayor of Casterbridge", "author": "Thomas Hardy", "level": "B2"},
    {"id": "classic_return_native", "title": "The Return of the Native", "author": "Thomas Hardy", "level": "B2"},
    {"id": "classic_jude_obscure", "title": "Jude the Obscure", "author": "Thomas Hardy", "level": "B2"},
    {"id": "classic_madame_bovary", "title": "Madame Bovary", "author": "Gustave Flaubert", "level": "B2"},
    {"id": "classic_pere_goriot", "title": "Le Père Goriot", "author": "Honoré de Balzac", "level": "B2"},
    {"id": "classic_eugenie_grandet", "title": "Eugénie Grandet", "author": "Honoré de Balzac", "level": "B2"},

    # C1 Seviyesi (4 Eser)
    {"id": "classic_war_and_peace", "title": "War and Peace", "author": "Leo Tolstoy", "level": "C1"},
    {"id": "classic_anna_karenina", "title": "Anna Karenina", "author": "Leo Tolstoy", "level": "C1"},
    {"id": "classic_brothers_karamazov", "title": "The Brothers Karamazov", "author": "Fyodor Dostoevsky", "level": "C1"},
    {"id": "classic_idiot", "title": "The Idiot", "author": "Fyodor Dostoevsky", "level": "C1"}
]

DATA_FILE = "classics_stories_data.json"

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

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} World Classics stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)")
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write classic drama and adventure stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 1500 to 2000 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications."
    
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
        time.sleep(6) # 6 seconds delay between chapters (safely under 15 RPM)
            
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
    
    # Calculate actual word count
    word_count = sum(len(p.split()) for p in story_en_paragraphs)
    print(f"  Success! Total paragraphs: {len(story_en_paragraphs)}, words: {word_count}, dictionary: {len(story_words)} words.")
    
    # Save progress instantly
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(8) # 8 seconds delay between books

print("Story generation completed!")
