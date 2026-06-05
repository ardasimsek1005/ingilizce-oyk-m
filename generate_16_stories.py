from generator_refiner import refine_story
import os
import json
import time
import urllib.request
import urllib.parse

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
    # B1 stories (6 stories)
    {"id": "elves_shoemaker", "title": "The Elves and the Shoemaker", "author": "Brothers Grimm", "level": "B1"},
    {"id": "emperors_clothes", "title": "The Emperor's New Clothes", "author": "Hans Christian Andersen", "level": "B1"},
    {"id": "happy_prince", "title": "The Happy Prince", "author": "Oscar Wilde", "level": "B1"},
    {"id": "wind_willows", "title": "The Wind in the Willows", "author": "Kenneth Grahame", "level": "B1"},
    {"id": "secret_garden", "title": "The Secret Garden", "author": "Frances Hodgson Burnett", "level": "B1"},
    {"id": "heidi", "title": "Heidi", "author": "Johanna Spyri", "level": "B1"},
    
    # B2 stories (6 stories)
    {"id": "little_prince", "title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "level": "B2"},
    {"id": "christmas_carol", "title": "A Christmas Carol", "author": "Charles Dickens", "level": "B2"},
    {"id": "around_world", "title": "Around the World in Eighty Days", "author": "Jules Verne", "level": "B2"},
    {"id": "time_machine", "title": "The Time Machine", "author": "H. G. Wells", "level": "B2"},
    {"id": "white_fang", "title": "White Fang", "author": "Jack London", "level": "B2"},
    {"id": "call_wild", "title": "The Call of the Wild", "author": "Jack London", "level": "B2"},
    
    # C1 stories (4 stories)
    {"id": "don_quixote", "title": "Don Quixote", "author": "Miguel de Cervantes", "level": "C1"},
    {"id": "moby_dick", "title": "Moby Dick", "author": "Herman Melville", "level": "C1"},
    {"id": "hunchback_notredame", "title": "The Hunchback of Notre Dame", "author": "Victor Hugo", "level": "C1"},
    {"id": "dorian_gray", "title": "The Picture of Dorian Gray", "author": "Oscar Wilde", "level": "C1"}
]

DATA_FILE = "expanded_stories_data.json"

# Load existing progress
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        expanded_data = json.load(f)
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
                print(f"  Rate limited (429). Sleeping for 30 seconds (Attempt {attempt + 1}/5)...")
                time.sleep(30)
            else:
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 10 seconds...")
                time.sleep(10)
    return None

print(f"Starting/resuming generation of 16 new stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/16] Skipping {story['title']} (Already generated)")
        continue
        
    print(f"[{idx+1}/16] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional literary author and language teacher. You write stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 1500 to 2000 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications."
    
    success = True
    chapter = 1
    import re
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...")
        prompt = f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 100-150 words in length. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the original classic plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 60 seconds before retrying this part...")
            time.sleep(60)
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
        time.sleep(3) # 3 seconds delay between parts
            
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
        json.load # dummy
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(3)

print("Story generation completed successfully!")
