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
    # A1 stories (15 stories)
    {"id": "lion_mouse", "title": "The Lion and the Mouse", "author": "Aesop", "level": "A1"},
    {"id": "ant_grasshopper", "title": "The Ant and the Grasshopper", "author": "Aesop", "level": "A1"},
    {"id": "town_country_mouse", "title": "The Town Mouse and the Country Mouse", "author": "Aesop", "level": "A1"},
    {"id": "crow_pitcher", "title": "The Crow and the Pitcher", "author": "Aesop", "level": "A1"},
    {"id": "wind_sun", "title": "The North Wind and the Sun", "author": "Aesop", "level": "A1"},
    {"id": "gingerbread_man", "title": "The Gingerbread Man", "author": "Traditional", "level": "A1"},
    {"id": "chicken_little", "title": "Chicken Little", "author": "Traditional", "level": "A1"},
    {"id": "enormous_turnip", "title": "The Enormous Turnip", "author": "Traditional", "level": "A1"},
    {"id": "three_billy_goats", "title": "Three Billy Goats Gruff", "author": "Traditional", "level": "A1"},
    {"id": "fisherman_wife", "title": "The Fisherman and His Wife", "author": "Brothers Grimm", "level": "A1"},
    {"id": "little_red_hen", "title": "The Little Red Hen", "author": "Traditional", "level": "A1"},
    {"id": "frog_prince", "title": "The Frog Prince", "author": "Brothers Grimm", "level": "A1"},
    {"id": "stone_soup", "title": "Stone Soup", "author": "Traditional", "level": "A1"},
    {"id": "star_money", "title": "The Star Money", "author": "Brothers Grimm", "level": "A1"},
    {"id": "city_musicians", "title": "The Bremen Town Musicians", "author": "Brothers Grimm", "level": "A1"},
    
    # A2 stories (16 stories)
    {"id": "peter_rabbit", "title": "The Tale of Peter Rabbit", "author": "Beatrix Potter", "level": "A2"},
    {"id": "bambi", "title": "Bambi", "author": "Felix Salten", "level": "A2"},
    {"id": "black_beauty", "title": "Black Beauty", "author": "Anna Sewell", "level": "A2"},
    {"id": "hans_brinker", "title": "Hans Brinker", "author": "Mary Mapes Dodge", "level": "A2"},
    {"id": "five_children_it", "title": "Five Children and It", "author": "E. Nesbit", "level": "A2"},
    {"id": "railway_children", "title": "The Railway Children", "author": "E. Nesbit", "level": "A2"},
    {"id": "swiss_family", "title": "The Swiss Family Robinson", "author": "Johann David Wyss", "level": "A2"},
    {"id": "doctor_dolittle", "title": "Doctor Dolittle", "author": "Hugh Lofting", "level": "A2"},
    {"id": "sleepy_hollow", "title": "The Legend of Sleepy Hollow", "author": "Washington Irving", "level": "A2"},
    {"id": "rip_van_winkle", "title": "Rip Van Winkle", "author": "Washington Irving", "level": "A2"},
    {"id": "velveteen_rabbit", "title": "The Velveteen Rabbit", "author": "Margery Williams", "level": "A2"},
    {"id": "water_babies", "title": "The Water-Babies", "author": "Charles Kingsley", "level": "A2"},
    {"id": "nutcracker", "title": "The Nutcracker", "author": "E. T. A. Hoffmann", "level": "A2"},
    {"id": "blue_bird", "title": "The Blue Bird", "author": "Maurice Maeterlinck", "level": "A2"},
    {"id": "tom_thumb", "title": "Tom Thumb", "author": "Brothers Grimm", "level": "A2"},
    {"id": "little_match_girl", "title": "The Little Match Girl", "author": "Hans Christian Andersen", "level": "A2"},

    # B1 stories (3 stories)
    {"id": "anne_green_gables", "title": "Anne of Green Gables", "author": "Lucy Maud Montgomery", "level": "B1"},
    {"id": "little_women", "title": "Little Women", "author": "Louisa May Alcott", "level": "B1"},
    {"id": "pollyanna", "title": "Pollyanna", "author": "Eleanor H. Porter", "level": "B1"},

    # B2 stories (4 stories)
    {"id": "pride_prejudice", "title": "Pride and Prejudice", "author": "Jane Austen", "level": "B2"},
    {"id": "war_of_worlds", "title": "The War of the Worlds", "author": "H. G. Wells", "level": "B2"},
    {"id": "dr_jekyll_mr_hyde", "title": "Strange Case of Dr Jekyll and Mr Hyde", "author": "Robert Louis Stevenson", "level": "B2"},
    {"id": "invisible_man", "title": "The Invisible Man", "author": "H. G. Wells", "level": "B2"},

    # C1 stories (2 stories)
    {"id": "crime_punishment", "title": "Crime and Punishment", "author": "Fyodor Dostoevsky", "level": "C1"},
    {"id": "les_miserables", "title": "Les Misérables", "author": "Victor Hugo", "level": "C1"}
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
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 15 seconds...")
                time.sleep(15)
    return None

print(f"Starting/resuming generation of 40 new stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/40] Skipping {story['title']} (Already generated)")
        continue
        
    print(f"[{idx+1}/40] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    if story["level"] == "A1":
        level_guidelines = "Ensure the grammar and vocabulary are extremely simple, suitable for absolute beginners (CEFR A1 level). Use simple present tense, basic sentences, and high-frequency everyday vocabulary. Avoid complex clauses or advanced idioms."
    elif story["level"] == "A2":
        level_guidelines = "Ensure the grammar and vocabulary are simple, suitable for CEFR A2 elementary level language learners. Use basic sentence structures, everyday language, and simple past or present tenses."
    elif story["level"] == "B1":
        level_guidelines = "Ensure the grammar and vocabulary are suitable for CEFR B1 intermediate level language learners. Use clear sentences and intermediate-level vocabulary."
    elif story["level"] == "B2":
        level_guidelines = "Ensure the grammar and vocabulary are suitable for CEFR B2 upper-intermediate level language learners. Use varied sentence structures and descriptive vocabulary."
    else:
        level_guidelines = "Ensure the grammar and vocabulary are suitable for CEFR C1 advanced level language learners. Use complex sentence structures, diverse styles, and rich, advanced vocabulary."

    sys_instruction = f"You are a professional literary author and language teacher. You write stories for English learners at the CEFR {story['level']} level. {level_guidelines} Your target word count for the entire story is 1500 to 2500 words. You will write the story across 5 chapters. Crucial rule: The story plot, characters, and sequence of events MUST strictly match the original classic plot of the story '{story['title']}' by {story['author']} without any modifications."
    
    success = True
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Chapter {chapter}/5...")
        prompt = f"Write Chapter {chapter} of the story '{story['title']}' by {story['author']}. This chapter should consist of exactly 3 descriptive paragraphs, with each paragraph being about 100-180 words in length. {level_guidelines} Keep the story matched to the original classic plot. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this chapter (base lowercase English forms and their Turkish meaning in this context)."
        if chapter > 1:
            prompt += f"\n\nContext of previous chapters:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 90 seconds before retrying this chapter...")
            time.sleep(90)
            continue
            
        # Append paragraphs
        story_en_paragraphs.extend(result["english_paragraphs"])
        story_tr_paragraphs.extend(result["turkish_paragraphs"])
        
        # Append vocabulary
        for w in result["vocabulary"]:
            en_word = w["en"].strip().lower()
            tr_word = w["tr"].strip()
            if en_word and tr_word:
                story_words[en_word] = tr_word
                
        chapter += 1
        time.sleep(5) # 5 seconds delay between chapters to avoid rate limits
            
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
        
    time.sleep(5)

print("Story generation completed successfully!")
