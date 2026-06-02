import os
import json
import time
import urllib.request
import urllib.parse
import re
from PIL import Image

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
    # A1 Stories
    {
        "id": "peter_wolf",
        "title": "Peter and the Wolf",
        "author": "Sergei Prokofiev",
        "level": "A1",
        "cover": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80"
    },
    {
        "id": "tin_soldier",
        "title": "The Steadfast Tin Soldier",
        "author": "Hans Christian Andersen",
        "level": "A1",
        "cover": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"
    },
    {
        "id": "magic_pot",
        "title": "The Magic Porridge Pot",
        "author": "Brothers Grimm",
        "level": "A1",
        "cover": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80"
    },
    {
        "id": "wolf_kids",
        "title": "The Wolf and the Seven Young Goats",
        "author": "Brothers Grimm",
        "level": "A1",
        "cover": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80"
    },
    {
        "id": "brave_tailor",
        "title": "The Brave Little Tailor",
        "author": "Brothers Grimm",
        "level": "A1",
        "cover": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80"
    },
    # B1 Stories
    {
        "id": "selfish_giant",
        "title": "The Selfish Giant",
        "author": "Oscar Wilde",
        "level": "B1",
        "cover": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80"
    },
    {
        "id": "nightingale",
        "title": "The Nightingale",
        "author": "Hans Christian Andersen",
        "level": "B1",
        "cover": "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600&q=80"
    },
    {
        "id": "tinderbox",
        "title": "The Tinderbox",
        "author": "Hans Christian Andersen",
        "level": "B1",
        "cover": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80"
    },
    {
        "id": "wild_swans",
        "title": "The Wild Swans",
        "author": "Hans Christian Andersen",
        "level": "B1",
        "cover": "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&q=80"
    },
    {
        "id": "goose_girl",
        "title": "The Goose Girl",
        "author": "Brothers Grimm",
        "level": "B1",
        "cover": "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&q=80"
    }
]

DATA_FILE = "expanded_stories_data.json"
public_covers_dir = "public/covers"
scratch_covers_dir = r"C:\Users\acer\.gemini\antigravity\scratch\stories\covers"

os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

# Load existing general stories
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        expanded_data = json.load(f)
else:
    expanded_data = {}

# Make sure we clean up the previous duplicates if they were written
for old_id in ["cinderella", "red_riding_hood", "jack_beanstalk", "ugly_duckling", "puss_in_boots", "hansel_gretel", "rapunzel", "sleeping_beauty", "goldilocks", "snowman"]:
    if old_id in expanded_data:
        del expanded_data[old_id]

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

def crop_to_square(img):
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    return img.crop((left, top, right, bottom))

def process_and_save_cover(img_path, s_id):
    try:
        with Image.open(img_path) as img:
            img_sq = crop_to_square(img)
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            webp_pub_path = os.path.join(public_covers_dir, f"{s_id}.webp")
            img_resized.save(webp_pub_path, "WEBP", quality=80)
            
            png_scr_path = os.path.join(scratch_covers_dir, f"{s_id}.png")
            img_resized.save(png_scr_path, "PNG")
            
            print(f"  Cover processed successfully for {s_id}")
            return True
    except Exception as e:
        print(f"  Error processing cover for {s_id}: {e}")
        return False

def clean_p(p):
    pattern = r"^\s*(?:chapter|capture|bölüm|part|section)\s+(?:[0-9]+|[ivxldm]+)\b[:\-\s\.]*"
    cleaned = re.sub(pattern, "", p, flags=re.IGNORECASE).strip()
    if re.match(r"^\s*(?:chapter|capture|bölüm|part|section)\s*(?:[0-9]+|[ivxldm]+)?\s*$", cleaned, re.IGNORECASE):
        return ""
    return cleaned

print("Starting Fairy Tales & Children Story Generation...")
for idx, story in enumerate(NEW_STORIES):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/10] Skipping {story['title']} (Already exists)")
        continue
        
    print(f"[{idx+1}/10] Generating {story['title']} (Level: {story['level']})...")
    
    # 1. Download and process cover
    temp_path = f"temp_cover_{s_id}.jpg"
    try:
        print(f"  Downloading cover from: {story['cover']}")
        urllib.request.urlretrieve(story['cover'], temp_path)
        process_and_save_cover(temp_path, s_id)
    except Exception as e:
        print(f"  Failed to download cover for {s_id}: {e}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    # 2. Generate Chapters using Gemini
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 1500 to 2000 words. You will write the story across 5 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications."
    
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Part {chapter}/5...")
        prompt = f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 100-150 words in length. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the original classic plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  API Error. Waiting 60 seconds and retrying...")
            time.sleep(60)
            continue
            
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
        
    # Save the story data
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
    
    # Save progress
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    word_count = sum(len(p.split()) for p in story_en_paragraphs)
    print(f"  Successfully saved {story['title']}. Words: {word_count}, Vocabulary: {len(story_words)} words.")
    time.sleep(5)

print("\nAll 10 stories successfully generated and saved!")
