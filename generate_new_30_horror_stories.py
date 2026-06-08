import os
import json
import time
import urllib.request
import urllib.parse
import re
import subprocess
from PIL import Image
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
    # A1 Seviyesi (8 Eser)
    {"id": "horror_tomb_mystery", "title": "The Tomb's Mystery", "author": "H. P. Lovecraft", "level": "A1", "keyword": "creepy-ancient-egyptian-tomb-glowing-mummy"},
    {"id": "horror_black_veil", "title": "The Minister's Black Veil", "author": "Nathaniel Hawthorne", "level": "A1", "keyword": "gothic-church-priest-black-veil-face-mystery"},
    {"id": "horror_haunted_inn", "title": "The Haunted Inn", "author": "Edward Bulwer-Lytton", "level": "A1", "keyword": "old-abandoned-wooden-inn-foggy-night"},
    {"id": "horror_strange_guest", "title": "The Strange Guest", "author": "Sheridan Le Fanu", "level": "A1", "keyword": "shadowy-man-knocking-on-wooden-door-rainy-night"},
    {"id": "horror_midnight_visitor", "title": "The Midnight Visitor", "author": "F. Marion Crawford", "level": "A1", "keyword": "ghostly-figure-entering-bedroom-window-moonlight"},
    {"id": "horror_secret_door", "title": "The Secret Door", "author": "Ann Radcliffe", "level": "A1", "keyword": "hidden-wooden-door-stone-wall-creepy-castle"},
    {"id": "horror_shadow_man", "title": "The Shadow Man", "author": "E. T. A. Hoffmann", "level": "A1", "keyword": "spooky-silhouette-tall-man-top-hat-streetlamp"},
    {"id": "horror_lost_in_woods", "title": "Lost in the Woods", "author": "Algernon Blackwood", "level": "A1", "keyword": "dark-creepy-forest-glowing-eyes-trees-night"},

    # A2 Seviyesi (8 Eser)
    {"id": "horror_cold_breeze", "title": "The Cold Breeze", "author": "Wilkie Collins", "level": "A2", "keyword": "wind-blowing-curtains-dark-gothic-window-candle"},
    {"id": "horror_silent_doll", "title": "The Silent Doll", "author": "M. R. James", "level": "A2", "keyword": "creepy-vintage-porcelain-doll-sitting-chair"},
    {"id": "horror_dusty_attic", "title": "The Dusty Attic", "author": "Arthur Conan Doyle", "level": "A2", "keyword": "cluttered-dark-dusty-attic-old-trunk-spiderwebs"},
    {"id": "horror_whispering_woods", "title": "The Whispering Woods", "author": "Algernon Blackwood", "level": "A2", "keyword": "misty-trees-forest-path-ghostly-fog-shapes"},
    {"id": "horror_phantom_train", "title": "The Phantom Train", "author": "Charles Dickens", "level": "A2", "keyword": "steam-train-engine-glowing-green-lights-tunnel"},
    {"id": "horror_empty_mirror", "title": "The Empty Mirror", "author": "Bram Stoker", "level": "A2", "keyword": "vintage-gold-mirror-no-reflection-dark-room"},
    {"id": "horror_creeping_shadow", "title": "The Creeping Shadow", "author": "H. P. Lovecraft", "level": "A2", "keyword": "dark-gooey-shadow-crawling-under-door"},
    {"id": "horror_ghostly_bell", "title": "The Ghostly Bell", "author": "Wilkie Collins", "level": "A2", "keyword": "large-iron-bell-church-tower-ringing-alone"},

    # B1 Seviyesi (5 Eser)
    {"id": "horror_spectre_bridegroom", "title": "The Spectre Bridegroom", "author": "Washington Irving", "level": "B1", "keyword": "ghostly-knight-horseback-gothic-bride-night"},
    {"id": "horror_tapestried_chamber", "title": "The Tapestried Chamber", "author": "Sir Walter Scott", "level": "B1", "keyword": "old-castle-bedroom-gothic-tapestry-haunted"},
    {"id": "horror_haunted_house", "title": "The Haunted and the Haunters", "author": "Edward Bulwer-Lytton", "level": "B1", "keyword": "large-creepy-victorian-house-glowing-windows"},
    {"id": "horror_mysterious_mansion", "title": "The Mysterious Mansion", "author": "Honoré de Balzac", "level": "B1", "keyword": "abandoned-french-chateau-gates-ivy-ruins"},
    {"id": "horror_cold_harbor", "title": "Cold Harbor", "author": "Francis Brett Young", "level": "B1", "keyword": "windy-sea-cliffs-old-stone-house-tempest"},

    # B2 Seviyesi (5 Eser)
    {"id": "horror_body_snatcher", "title": "The Body Snatcher", "author": "Robert Louis Stevenson", "level": "B2", "keyword": "two-men-digging-grave-lantern-rainy-cemetery"},
    {"id": "horror_lazarus", "title": "Lazarus", "author": "Leonid Andreyev", "level": "B2", "keyword": "man-rising-tomb-shroud-pale-face-desert"},
    {"id": "horror_damned_thing", "title": "The Damned Thing", "author": "Ambrose Bierce", "level": "B2", "keyword": "invisible-monster-moving-wheat-field-sunlight"},
    {"id": "horror_middle_toe", "title": "The Middle Toe of the Right Foot", "author": "Ambrose Bierce", "level": "B2", "keyword": "empty-wooden-room-dusty-floor-single-footprint"},
    {"id": "horror_beast_five_fingers", "title": "The Beast with Five Fingers", "author": "W. F. Harvey", "level": "B2", "keyword": "severed-hand-crawling-on-piano-keys-night"},

    # C1 Seviyesi (4 Eser)
    {"id": "horror_gorgon_head", "title": "The Gorgon's Head", "author": "Nathaniel Hawthorne", "level": "C1", "keyword": "medusa-serpent-hair-stone-statues-gothic"},
    {"id": "horror_shadow_out_of_time", "title": "The Shadow Out of Time", "author": "H. P. Lovecraft", "level": "C1", "keyword": "giant-alien-library-stone-columns-monsters"},
    {"id": "horror_whisperer_in_darkness", "title": "The Whisperer in Darkness", "author": "H. P. Lovecraft", "level": "C1", "keyword": "creepy-crab-like-alien-whispering-dark-room"},
    {"id": "horror_colour_out_of_space", "title": "The Colour Out of Space", "author": "H. P. Lovecraft", "level": "C1", "keyword": "glowing-strange-purple-meteorite-well-farmhouse"}
]

DATA_FILE = "new_30_horror_stories_data.json"
public_covers_dir = r"public\covers"
scratch_covers_dir = r"scratch\horror\covers"

os.makedirs(public_covers_dir, exist_ok=True)
os.makedirs(scratch_covers_dir, exist_ok=True)

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
                        "description": "3 paragraphs of the story in English, about 120-150 words each"
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

def download_unsplash_cover(s_id, keyword):
    webp_path = os.path.join(public_covers_dir, f"{s_id}.webp")
    if os.path.exists(webp_path):
        print(f"  Cover for {s_id} already exists. Skipping download.")
        return True

    # Search unsplash for Pixar 3D animated character styled horror images
    query = urllib.parse.quote(keyword.replace("-", " ") + " 3d character pixar animation style")
    search_url = f"https://source.unsplash.com/featured/500x500/?{query}"
    
    temp_path = f"temp_{s_id}.jpg"
    try:
        req = urllib.request.Request(
            search_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=25) as response:
            with open(temp_path, "wb") as f:
                f.write(response.read())
    except Exception as e:
        print(f"  Unsplash download failed for {s_id}: {e}. Falling back to default dark gothic abstract...")
        try:
            fallback_photo_url = "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80"
            req = urllib.request.Request(fallback_photo_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=25) as response:
                with open(temp_path, "wb") as f:
                    f.write(response.read())
        except Exception as fe:
            print(f"  Fallback cover failed: {fe}")
            return False

    try:
        with Image.open(temp_path) as img:
            img_sq = crop_to_square(img)
            img_resized = img_sq.resize((500, 500), Image.Resampling.LANCZOS)
            
            webp_path = os.path.join(public_covers_dir, f"{s_id}.webp")
            img_resized.save(webp_path, "WEBP", quality=80)
            
            png_path = os.path.join(scratch_covers_dir, f"{s_id}.png")
            img_resized.save(png_path, "PNG")
            
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"  Successfully processed cover for {s_id}")
        return True
    except Exception as e:
        print(f"  Error processing cover image for {s_id}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False

print(f"Starting/resuming expansion of {len(STORIES_TO_GENERATE)} Horror & Mystery stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Skipping {story['title']} (Already generated)")
        # Make sure cover is generated just in case
        download_unsplash_cover(s_id, story["keyword"])
        continue
        
    print(f"[{idx+1}/{len(STORIES_TO_GENERATE)}] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    sys_instruction = f"You are a professional children's literary author and language teacher. You write gothic/horror/mystery stories for English learners at the CEFR {story['level']} level. Your target word count for the entire story is 2500 to 3000 words. You will write the story across exactly 7 parts. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 7:
        print(f"  Generating Part {chapter}/7...")
        prompt = f"Write Part {chapter} of the story '{story['title']}' by {story['author']}. This part should consist of exactly 3 descriptive paragraphs, with each paragraph being about 120-150 words in length to satisfy the 2500-3000 words total count. Ensure the grammar and vocabulary are appropriate for CEFR {story['level']} learners. Keep the story matched to the original classic plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this part (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Capture X', 'Part X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous parts:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 120 seconds before retrying this part...")
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
        time.sleep(3) # polite delay between parts
            
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
        
    # Download Unsplash Cover Image
    download_unsplash_cover(s_id, story["keyword"])
    
    time.sleep(4)

print("\n--- Story Generation Phase Complete! Starting compilation... ---")

# Run Compile Stories
print("Running compile_stories.py...")
subprocess.run(["python", "compile_stories.py"], check=True)

# Run Vite build to verify compilation
print("Running Vite build...")
subprocess.run([r"node-portable\node.exe", r"node_modules\vite\bin\vite.js", "build"], check=True)

# Run Capacitor Sync
print("Running Capacitor Sync...")
subprocess.run([r"node-portable\node.exe", r"node_modules\@capacitor\cli\bin\capacitor", "sync", "android"], check=True)

# Build & install Android debug build on connected emulator
print("Compiling and deploying to Android device/emulator...")
subprocess.run([r"cmd.exe", "/c", "gradlew.bat installDebug"], cwd="android", check=True)

# Relaunch application on emulator
print("Relaunching app on emulator...")
subprocess.run([
    r"C:\Users\acer\AppData\Local\Android\Sdk\platform-tools\adb.exe", "shell", "am", "start", 
    "-n", "com.ingilizceoykum.app/com.ingilizceoykum.app.MainActivity"
], check=True)

print("\n[SUCCESS] ALL 30 STORIES SUCCESSFULLY ADDED, COMPILED, INTEGRATED AND DEPLOYED!")
