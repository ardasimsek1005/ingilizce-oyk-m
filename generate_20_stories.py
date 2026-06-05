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

NEW_STORIES = [
    # kids_fables B2 (6 stories)
    {"id": "magic_flute", "title": "The Magic Flute", "author": "Wolfgang Amadeus Mozart", "level": "B2"},
    {"id": "king_thrushbeard", "title": "King Thrushbeard", "author": "Brothers Grimm", "level": "B2"},
    {"id": "iron_hans", "title": "Iron Hans", "author": "Brothers Grimm", "level": "B2"},
    {"id": "water_of_life", "title": "The Water of Life", "author": "Brothers Grimm", "level": "B2"},
    {"id": "three_spinners", "title": "The Three Spinners", "author": "Brothers Grimm", "level": "B2"},
    {"id": "six_swans", "title": "The Six Swans", "author": "Brothers Grimm", "level": "B2"},

    # kids_fables C1 (5 stories)
    {"id": "birthday_infanta", "title": "The Birthday of the Infanta", "author": "Oscar Wilde", "level": "C1"},
    {"id": "fisherman_soul", "title": "The Fisherman and His Soul", "author": "Oscar Wilde", "level": "C1"},
    {"id": "young_king", "title": "The Young King", "author": "Oscar Wilde", "level": "C1"},
    {"id": "devoted_friend", "title": "The Devoted Friend", "author": "Oscar Wilde", "level": "C1"},
    {"id": "remarkably_rocket", "title": "The Remarkable Rocket", "author": "Oscar Wilde", "level": "C1"},

    # kids_fables B1 (3 stories)
    {"id": "east_sun_west_moon", "title": "East of the Sun and West of the Moon", "author": "Norse Fairytale", "level": "B1"},
    {"id": "snow_white_rose_red", "title": "Snow-White and Rose-Red", "author": "Brothers Grimm", "level": "B1"},
    {"id": "twelve_dancing_princesses", "title": "The Twelve Dancing Princesses", "author": "Brothers Grimm", "level": "B1"},

    # horror_mystery A1 (3 stories)
    {"id": "horror_lost_tomb", "title": "The Legend of the Lost Tomb", "author": "Mystery Author", "level": "A1"},
    {"id": "horror_secret_passage", "title": "The Secret of the Passage", "author": "Mystery Author", "level": "A1"},
    {"id": "horror_haunted_mirror", "title": "The Mystery of the Haunted Mirror", "author": "Mystery Author", "level": "A1"},

    # horror_mystery C1 (3 stories)
    {"id": "horror_lazarus", "title": "Lazarus", "author": "Leonid Andreyev", "level": "C1"},
    {"id": "horror_shadow_out_of_time", "title": "The Shadow Out of Time", "author": "H. P. Lovecraft", "level": "C1"},
    {"id": "horror_outsider", "title": "The Outsider", "author": "H. P. Lovecraft", "level": "C1"}
]

DATA_FILE = "new_20_stories.json"
TARGET_TS_FILE = "src/stories_part2.ts"

if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        stories_data = json.load(f)
else:
    stories_data = {}

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
                        "description": "Exactly 3 detailed paragraphs of the story in English. Each paragraph MUST be about 140-170 words in length, dense, descriptive, and level-appropriate."
                    },
                    "turkish_paragraphs": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"},
                        "description": "Accurate, beautiful Turkish translation of each of the 3 English paragraphs."
                    },
                    "vocabulary": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "en": {"type": "STRING", "description": "English word (base form, lowercase)"},
                                "tr": {"type": "STRING", "description": "Turkish meaning in this context"}
                            },
                            "required": ["en", "tr"]
                        },
                        "description": "5-8 key vocabulary words extracted from this chapter."
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

print(f"Starting programmatic generation of {len(NEW_STORIES)} stories...")

for idx, story in enumerate(NEW_STORIES):
    s_id = story["id"]
    if s_id in stories_data:
        print(f"[{idx+1}/{len(NEW_STORIES)}] Skipping '{story['title']}' (Already generated)")
        continue
        
    print(f"[{idx+1}/{len(NEW_STORIES)}] Generating '{story['title']}' (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = (
        f"You are a professional children's literary author and language teacher. "
        f"You write stories for English learners at the CEFR {story['level']} level. "
        f"Your target word count for the entire story is 2000 to 2500 words. You will write the story across 5 parts. "
        f"Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot "
        f"of the story '{story['title']}' by {story['author']} without any modifications."
    )
    
    chapter = 1
    success = True
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...")
        prompt = (
            f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. "
            f"This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 140-170 words in length. "
            f"Ensure the total word count for this part is at least 420 words. Ensure the grammar and vocabulary "
            f"are appropriate for CEFR {story['level']} learners. Keep the story matched to the original classic plot. "
            f"Also provide a beautiful and contextually accurate Turkish translation for each paragraph, "
            f"and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). "
            f"Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Part X') in the paragraphs. "
            f"Start writing the story text directly."
        )
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 120 seconds before retrying...")
            time.sleep(120)
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

        story_en_paragraphs.extend(cleaned_en)
        story_tr_paragraphs.extend(cleaned_tr)
        
        for w in result["vocabulary"]:
            en_word = w["en"].strip().lower()
            tr_word = w["tr"].strip()
            if en_word and tr_word:
                story_words[en_word] = tr_word
                
        chapter += 1
        time.sleep(5)
        
    word_count = sum(len(p.split()) for p in story_en_paragraphs)
    print(f"  Completed '{story['title']}'! Paragraphs: {len(story_en_paragraphs)}, Words: {word_count}, Dict: {len(story_words)} words.")
    
    # Save the story data
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

    stories_data[s_id] = {
        "id": s_id,
        "title": story["title"],
        "author": story["author"],
        "level": story["level"],
        "coverUrl": f"/covers/{s_id}.png",
        "en": story_en_paragraphs,
        "tr": story_tr_paragraphs,
        "words": story_words
    }
    
    # Write backup
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(stories_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(5)

print("\nAll 20 stories have been generated in new_20_stories.json.")

# Now format and append them to src/stories_part2.ts
try:
    with open(TARGET_TS_FILE, "r", encoding="utf-8") as f:
        ts_content = f.read()

    last_index = ts_content.lastIndexOf = ts_content.rfind("];")
    if last_index == -1:
        raise Exception("Could not find the closing ]; in stories_part2.ts")

    def esc(s):
        return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')

    formatted_stories = []
    for s_id, story in stories_data.items():
        en_lines = ",\n      ".join(f'"{esc(p)}"' for p in story["en"])
        tr_lines = ",\n      ".join(f'"{esc(p)}"' for p in story["tr"])
        words_lines = ",\n      ".join(f'"{esc(k)}": "{esc(v)}"' for k, v in story["words"].items())
        
        story_code = f"""  {{
    id: '{story["id"]}',
    title: "{esc(story["title"])}",
    author: '{esc(story["author"])}',
    level: '{story["level"]}',
    coverUrl: '{story["coverUrl"]}',
    en: [
      {en_lines}
    ],
    tr: [
      {tr_lines}
    ],
    words: {{
      {words_lines}
    }}
  }}"""
        formatted_stories.append(story_code)
        
    new_entries_code = ",\n" + ",\n".join(formatted_stories) + "\n"
    updated_content = ts_content[:last_index] + new_entries_code + ts_content[last_index:]
    
    with open(TARGET_TS_FILE, "w", encoding="utf-8") as f:
        f.write(updated_content)
        
    print(f"Successfully compiled and appended all 20 stories to {TARGET_TS_FILE}!")
except Exception as e:
    print(f"Error compiling/writing to stories_part2.ts: {e}")
