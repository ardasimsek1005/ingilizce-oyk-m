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
    {"id": "history_giza_pyramids", "title": "The Pyramids of Giza", "author": "Ancient Egypt", "level": "A1"},
    {"id": "history_great_wall", "title": "The Great Wall of China", "author": "Ancient China", "level": "A1"},
    {"id": "history_roman_colosseum", "title": "The Roman Colosseum", "author": "Roman Empire", "level": "A1"},
    {"id": "history_marco_polo", "title": "Marco Polo's Journey", "author": "Marco Polo", "level": "A1"},
    {"id": "history_discovery_fire", "title": "The Discovery of Fire", "author": "Prehistoric Era", "level": "A1"},
    {"id": "history_troy_legend", "title": "The Legend of Troy", "author": "Greek Mythology", "level": "A1"},
    {"id": "history_pompeii", "title": "Pompeii: The City Frozen in Time", "author": "Roman Empire", "level": "A1"},
    {"id": "history_paper_invention", "title": "The Story of Paper", "author": "Ancient China", "level": "A1"},
    {"id": "history_viking_voyagers", "title": "The Viking Voyagers", "author": "Viking Age", "level": "A1"},
    {"id": "history_first_marathon", "title": "The First Marathon", "author": "Ancient Greece", "level": "A1"},

    # A2 Level (15 Stories)
    {"id": "history_alexander_great", "title": "Alexander the Great's Quest", "author": "Alexander the Great", "level": "A2"},
    {"id": "history_julius_caesar", "title": "Julius Caesar and the Rubicon", "author": "Julius Caesar", "level": "A2"},
    {"id": "history_cleopatra", "title": "Cleopatra: The Last Pharaoh", "author": "Cleopatra", "level": "A2"},
    {"id": "history_joan_of_arc", "title": "Joan of Arc: The Maid of Orléans", "author": "Joan of Arc", "level": "A2"},
    {"id": "history_christopher_columbus", "title": "Christopher Columbus and the New World", "author": "Christopher Columbus", "level": "A2"},
    {"id": "history_leonardo_da_vinci", "title": "Leonardo da Vinci: The Renaissance Man", "author": "Leonardo da Vinci", "level": "A2"},
    {"id": "history_gutenberg_press", "title": "The Gutenberg Press", "author": "Johannes Gutenberg", "level": "A2"},
    {"id": "history_taj_mahal", "title": "The Taj Mahal: A Monument of Love", "author": "Mughal Empire", "level": "A2"},
    {"id": "history_robin_hood", "title": "The Legend of Robin Hood", "author": "English Folklore", "level": "A2"},
    {"id": "history_boston_tea_party", "title": "The Boston Tea Party", "author": "American Revolution", "level": "A2"},
    {"id": "history_magna_carta", "title": "The Magna Carta", "author": "King John", "level": "A2"},
    {"id": "history_wright_brothers", "title": "The First Flight of the Wright Brothers", "author": "Wright Brothers", "level": "A2"},
    {"id": "history_galileo_galilei", "title": "Galileo Galilei and the Stars", "author": "Galileo Galilei", "level": "A2"},
    {"id": "history_king_arthur", "title": "King Arthur and the Round Table", "author": "Arthurian Legend", "level": "A2"},
    {"id": "history_silk_road", "title": "The Story of the Silk Road", "author": "Ancient Trade", "level": "A2"},

    # B1 Level (13 Stories)
    {"id": "history_fall_constantinople", "title": "The Fall of Constantinople", "author": "Byzantine Empire", "level": "B1"},
    {"id": "history_french_revolution", "title": "The French Revolution: Storming the Bastille", "author": "French Revolution", "level": "B1"},
    {"id": "history_isaac_newton", "title": "Isaac Newton and the Apple", "author": "Isaac Newton", "level": "B1"},
    {"id": "history_industrial_revolution", "title": "The Industrial Revolution: Steam Power", "author": "Industrial Revolution", "level": "B1"},
    {"id": "history_gettysburg_address", "title": "Abraham Lincoln and the Gettysburg Address", "author": "Abraham Lincoln", "level": "B1"},
    {"id": "history_eiffel_tower", "title": "The Building of the Eiffel Tower", "author": "Gustave Eiffel", "level": "B1"},
    {"id": "history_sinking_titanic", "title": "The Sinking of the Titanic", "author": "Titanic", "level": "B1"},
    {"id": "history_tutankhamun_tomb", "title": "The Discovery of Tutankhamun's Tomb", "author": "Howard Carter", "level": "B1"},
    {"id": "history_albert_einstein", "title": "Albert Einstein and the Theory of Relativity", "author": "Albert Einstein", "level": "B1"},
    {"id": "history_apollo_11", "title": "The Space Race: Apollo 11", "author": "NASA", "level": "B1"},
    {"id": "history_marie_curie", "title": "Marie Curie and the Discovery of Radium", "author": "Marie Curie", "level": "B1"},
    {"id": "history_great_fire_london", "title": "The Great Fire of London", "author": "Great Fire of London", "level": "B1"},
    {"id": "history_rosetta_stone", "title": "The Rosetta Stone: Decoding Hieroglyphs", "author": "Jean-François Champollion", "level": "B1"},

    # B2 Level (9 Stories)
    {"id": "history_renaissance_florence", "title": "The Renaissance: Florence Reborn", "author": "Renaissance", "level": "B2"},
    {"id": "history_enlightenment", "title": "The Age of Enlightenment", "author": "Enlightenment Thinkers", "level": "B2"},
    {"id": "history_berlin_wall", "title": "The Fall of the Berlin Wall", "author": "Cold War", "level": "B2"},
    {"id": "history_penicillin_discovery", "title": "The Discovery of Penicillin", "author": "Alexander Fleming", "level": "B2"},
    {"id": "history_declaration_independence", "title": "The Signing of the Declaration of Independence", "author": "Founding Fathers", "level": "B2"},
    {"id": "history_code_hammurabi", "title": "The Code of Hammurabi", "author": "Babylon", "level": "B2"},
    {"id": "history_american_civil_war", "title": "The American Civil War: Emancipation Proclamation", "author": "American Civil War", "level": "B2"},
    {"id": "history_printing_revolution", "title": "The Story of the Printing Revolution", "author": "Printing Press", "level": "B2"},
    {"id": "history_black_death", "title": "The Black Death: The Plague of Europe", "author": "Middle Ages", "level": "B2"},

    # C1 Level (3 Stories)
    {"id": "history_roman_empire", "title": "The Rise and Fall of the Roman Empire", "author": "Roman Empire", "level": "C1"},
    {"id": "history_library_alexandria", "title": "The Library of Alexandria", "author": "Ancient Egypt", "level": "C1"},
    {"id": "history_history_writing", "title": "The History of Writing", "author": "Human Civilisation", "level": "C1"}
]

DATA_FILE = "history_stories_data.json"

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
                        "minItems": 3,
                        "maxItems": 3,
                        "description": "3 paragraphs of the story in English, about 130-170 words each"
                    },
                    "turkish_paragraphs": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "minItems": 3,
                        "maxItems": 3,
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
                print("  Model gemini-flash-latest error. Trying gemini-2.0-flash...", flush=True)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
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
    
    sys_instruction = f"You are a professional historical author and language teacher. You write historical and mythological stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2000 to 2500 words. You will write the story across 5 parts. Crucial rule: The story plot, historical context, key figures, and sequence of events MUST strictly match the actual history or popular legend of '{story['title']}' without any modifications, making it highly engaging and suitable for adults."
    
    success = True
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...", flush=True)
        prompt = f"Write Part {chapter} of the historical story '{story['title']}' ({story['author']}). This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 130-170 words in length to hit the overall 2000-2500 word limit. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the actual historical facts or folklore. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
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
        time.sleep(35) # 35 seconds delay between chapters
            
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
        
    time.sleep(45) # 45 seconds delay between stories

print("History story generation completed!", flush=True)
