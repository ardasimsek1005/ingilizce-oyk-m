import os
import json
import time
import urllib.request

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

def call_gemini_translation_batch(words):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    words_list = ", ".join(words)
    prompt = f"Translate the following English words to Turkish. Give the translation that fits common literary or general contexts. Return ONLY a JSON object where the keys are the exact English words and the values are their Turkish translations.\nWords: {words_list}"
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "additionalProperties": {"type": "STRING"}
            }
        }
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content.strip())
        except Exception as e:
            print(f"  Batch translation attempt {attempt+1} failed: {e}. Retrying...")
            time.sleep(10)
    return {}

files = ["expanded_stories_data.json", "horror_stories_data.json", "classics_stories_data.json"]

proper_noun_keywords = {
    "tom", "huck", "jim", "alice", "aladdin", "pinocchio", "cinderella", "sinbad", "peter", "pan", "wendy",
    "beauty", "beast", "heidi", "clara", "bambi", "oliver", "twist", "fagin", "dracula", "frankenstein", "monster",
    "sherlock", "holmes", "watson", "gulliver", "crusoe", "friday", "hansel", "gretel", "rapunzel", "goldilocks",
    "moby", "dick", "ishel", "ahab", "gatsby", "daisy", "nick", "carmilla", "laura", "londra", "london", "paris",
    "rome", "turkey", "america", "england", "france", "germany", "carmen", "perrault", "andersen", "grimm", "charles",
    "mr", "mrs", "ms", "dr", "st", "john", "mary", "elizabeth", "jane", "darcy", "emma", "woodhouse", "knightley",
    "rochester", "scrooge", "marley", "pip", "estella", "dorian", "gray", "basil", "henry", "sibyl", "jeckyll", "hyde",
    "utterson", "lanyon"
}

words_needing_translation = set()
stories_with_errors = []

print("Scanning databases for translation mismatches...")
for f_name in files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for s_id, story in data.items():
            words_dict = story.get("words", {})
            for eng, tr in list(words_dict.items()):
                eng_clean = eng.strip().lower()
                tr_clean = tr.strip().lower() if tr else ""
                
                # Check for empty translation or translation matches English key
                if not tr_clean or eng_clean == tr_clean:
                    # Check if it is a proper noun
                    is_proper = False
                    for kw in proper_noun_keywords:
                        if kw in eng_clean:
                            is_proper = True
                            break
                            
                    if is_proper:
                        # Fix as Proper Noun
                        words_dict[eng] = "Özel İsim"
                        print(f"  [{story['title']}] Marked proper noun '{eng}' -> 'Özel İsim'")
                    else:
                        # Mark for batch translation
                        words_needing_translation.add(eng_clean)
                        stories_with_errors.append((f_name, s_id, eng))
                        
print(f"Found {len(words_needing_translation)} unique words needing Turkish translation.")

# Translate words in batches of 40
translations_map = {}
if words_needing_translation:
    words_list = list(words_needing_translation)
    batch_size = 40
    for i in range(0, len(words_list), batch_size):
        batch = words_list[i:i+batch_size]
        print(f"Translating batch {i//batch_size + 1} of {len(words_list)//batch_size + 1} ({len(batch)} words)...")
        translations = call_gemini_translation_batch(batch)
        for k, v in translations.items():
            translations_map[k.strip().lower()] = v.strip()
        time.sleep(2)

# Update database files with the new translations
for f_name in files:
    if os.path.exists(f_name):
        with open(f_name, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        updated = False
        for s_id, story in data.items():
            words_dict = story.get("words", {})
            for eng, tr in list(words_dict.items()):
                eng_clean = eng.strip().lower()
                tr_clean = tr.strip().lower() if tr else ""
                
                if not tr_clean or eng_clean == tr_clean:
                    if eng_clean in translations_map:
                        words_dict[eng] = translations_map[eng_clean]
                        print(f"  [{story['title']}] Corrected '{eng}' -> '{translations_map[eng_clean]}'")
                        updated = True
                    elif words_dict[eng] == eng:
                        # Fallback for names or remaining matches
                        words_dict[eng] = "Özel İsim"
                        print(f"  [{story['title']}] Fallback proper noun '{eng}' -> 'Özel İsim'")
                        updated = True
                        
        if updated:
            with open(f_name, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Saved updates to {f_name}")

print("\nWord scanning and correction completed!")
