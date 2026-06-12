import os
import json
import time
import sys
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini API key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY environment variable not set. Please set it before running this script.")

client = genai.Client(api_key=api_key) if api_key else None

DATA_FILES = [
    "expanded_stories_data.json",
    "horror_stories_data.json",
    "new_30_horror_stories_data.json",
    "classics_stories_data.json",
    "new_30_stories_data.json",
    "daily_stories_data.json",
    "new_20_stories.json",
    "scifi_stories_data.json",
    "detective_stories_data.json",
    "history_stories_data.json",
    "new_50_history_stories_data.json",
    "mythology_stories_data.json",
    "travel_culture_stories_data.json",
    "nature_space_stories_data.json"
]

TARGET_LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ar": "Arabic",
    "zh": "Chinese",
    "hi": "Hindi",
    "ja": "Japanese",
    "tr": "Turkish"
}

OUT_PATH = "src/pretranslated_stories.json"
TITLE_TRANS_PATH = "src/story_title_translations.json"

def load_all_source_stories():
    stories = {}
    for filename in DATA_FILES:
        if os.path.exists(filename):
            try:
                with open(filename, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    stories.update(data)
                    print(f"Loaded {len(data)} stories from {filename}")
            except Exception as e:
                print(f"Error loading {filename}: {e}")
    return stories

def load_existing_translations():
    if os.path.exists(OUT_PATH):
        try:
            with open(OUT_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return {}

def save_translations(data):
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_turkish_titles():
    if os.path.exists(TITLE_TRANS_PATH):
        try:
            with open(TITLE_TRANS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return {}

def translate_book_to_lang_gemini(title, paragraphs, words_dict, target_lang_name):
    if not client:
        return None
    
    # We ask the model to translate:
    # 1. The title (string)
    # 2. The paragraphs (list of strings)
    # 3. The dictionary definitions (keys are English words, values are Turkish definitions. We want the translated definitions as values)
    input_data = {
        "title": title,
        "paragraphs": paragraphs,
        "words": words_dict
    }
    
    sys_instruction = f"""You are a professional children's book translator and bilingual dictionary editor.
Your task is to translate the English book details into natural, simple, and clean {target_lang_name}.

You must translate:
1. "title" (translate the English title).
2. "paragraphs" (translate each English paragraph separately, maintaining the exact list index, structure, and order).
3. "words" (the values in the dictionary are Turkish definitions of English words. Translate these Turkish definitions into concise and clear {target_lang_name}. Keep the keys exactly as they are in the input, but replace the values with the {target_lang_name} translations).

You must return a valid JSON object matching the exact structure and keys of the input.
Do NOT include any markdown formatting or code blocks. Return ONLY the raw JSON object.
"""

    prompt = json.dumps(input_data, ensure_ascii=False)
    
    for attempt in range(4):
        try:
            response = client.models.generate_content(
                model='gemini-3.1-flash-lite',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=sys_instruction,
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )
            res_text = response.text.strip()
            
            # Remove any triple backticks just in case
            if res_text.startswith("```"):
                lines = res_text.splitlines()
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                res_text = "\n".join(lines).strip()
                
            parsed = json.loads(res_text)
            
            # Simple validation checks
            if "title" in parsed and "paragraphs" in parsed and "words" in parsed:
                if len(parsed["paragraphs"]) == len(paragraphs):
                    return parsed
            
            print(f"Validation failed (mismatched paragraph count or missing keys) on attempt {attempt+1}")
        except Exception as e:
            print(f"Gemini API request failed on attempt {attempt+1}: {e}")
        
        # Exponential backoff
        sleep_time = (2 ** attempt) + 2
        print(f"Sleeping for {sleep_time} seconds before retrying...")
        time.sleep(sleep_time)
        
    return None

def main():
    print("=== Start translation process ===")
    source_stories = load_all_source_stories()
    translations = load_existing_translations()
    tr_titles = load_turkish_titles()
    
    story_ids = list(source_stories.keys())
    story_ids.sort()
    
    # We choose the first 50 stories or we can translate specific ones
    selected_story_ids = story_ids[:50]
    print(f"Translating {len(selected_story_ids)} stories out of {len(story_ids)} in total...")
    
    for s_idx, s_id in enumerate(selected_story_ids):
        story = source_stories[s_id]
        print(f"\n[{s_idx+1}/{len(selected_story_ids)}] Processing story: {s_id} ({story['title']})")
        
        if s_id not in translations:
            translations[s_id] = {
                "title": {},
                "paragraphs": [],
                "words": {}
            }
            
        story_trans = translations[s_id]
        
        en_paragraphs = story["en"]
        if not story_trans["paragraphs"] or len(story_trans["paragraphs"]) != len(en_paragraphs):
            story_trans["paragraphs"] = [{} for _ in en_paragraphs]
            
        # First process Turkish since it's local
        story_trans["title"]["en"] = story["title"] # Ensure English title is stored
        story_trans["title"]["tr"] = tr_titles.get(s_id, story.get("titleTr") or story["title"])
        for p_idx, tr_text in enumerate(story["tr"]):
            if p_idx < len(story_trans["paragraphs"]):
                story_trans["paragraphs"][p_idx]["tr"] = tr_text
        for w, definition in story["words"].items():
            if w not in story_trans["words"]:
                story_trans["words"][w] = {}
            story_trans["words"][w]["tr"] = definition
            
        save_translations(translations)
        
        # Now iterate through target languages
        for lang_code, lang_name in TARGET_LANGUAGES.items():
            if lang_code == "tr":
                continue # Already handled
                
            # Check if this language is already fully translated for this story
            has_title = lang_code in story_trans["title"]
            has_paragraphs = all(lang_code in p for p in story_trans["paragraphs"])
            has_words = all(lang_code in story_trans["words"].get(w, {}) for w in story["words"])
            
            if has_title and has_paragraphs and has_words:
                # print(f"  {lang_name} already fully translated. Skipping.")
                continue
                
            print(f"  Translating to {lang_name}...")
            
            # Call Gemini
            res = translate_book_to_lang_gemini(
                story["title"],
                en_paragraphs,
                story["words"],
                lang_name
            )
            
            if res:
                # Save the title
                story_trans["title"][lang_code] = res["title"]
                
                # Save paragraphs
                for p_idx, p_text in enumerate(res["paragraphs"]):
                    if p_idx < len(story_trans["paragraphs"]):
                        story_trans["paragraphs"][p_idx][lang_code] = p_text
                        
                # Save words
                for w, trans_val in res["words"].items():
                    if w not in story_trans["words"]:
                        story_trans["words"][w] = {}
                    story_trans["words"][w][lang_code] = trans_val
                    
                save_translations(translations)
                print(f"  Successfully translated to {lang_name}!")
            else:
                print(f"  Failed to translate to {lang_name} after multiple attempts.")
                
            # Short sleep to space requests out and prevent aggressive API hits
            time.sleep(1.0)
            
    print("\nTranslation process completed successfully!")

if __name__ == "__main__":
    main()
