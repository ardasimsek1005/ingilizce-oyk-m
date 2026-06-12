import json
import urllib.request
import time

def refine_story(level, story_data, api_key):
    """
    Refines the vocabulary of A1/A2 stories using Gemini 2.5 Flash to ensure
    strict compliance with CEFR guidelines.
    """
    if level not in ["A1", "A2"]:
        return story_data
        
    prompt = f"""
You are a CEFR English language curriculum specialist and professional translator.
Analyze the following English paragraphs for a story of level {level}.

Target Level constraints:
- For "A1": Replace any B1, B2, C1, or C2 words with A1/A2 equivalents (or basic sentence structures). Common words like "courage" (B1), "suddenly" (B1), "immediately" (B2), "wolf" (B2), "tin" (B1), "porridge" (C2), "forest" (A2) must be replaced with simpler words (e.g., "heart/bravery", "quickly/soon", "now", "wild dog", "metal", "warm food", "woods/trees") or restructured.
- For "A2": Replace any C1 or C2 words, and keep B1/B2 words to a bare minimum. Simplify words like "cottage" (B2) to "cabin/small house", "wealthy" (B2) to "rich", "status" (B1) to "position", etc.
- In both levels: Do NOT classify basic words like "mother", "father", "friend", "home" as out-of-level. They are fully A1/A2.
- Make sure that when you modify the English paragraph, you modify the corresponding Turkish paragraph at the same index so that translations remain perfectly aligned.
- Review the provided "words" list. If a word listed there was replaced, update the key/value pair in the returned "words" object.

Input English Paragraphs:
{json.dumps(story_data.get("en", []), indent=2, ensure_ascii=False)}

Input Turkish Paragraphs:
{json.dumps(story_data.get("tr", []), indent=2, ensure_ascii=False)}

Input Interactive Vocabulary (words):
{json.dumps(story_data.get("words", {}), indent=2, ensure_ascii=False)}

Return a JSON object in this exact schema:
{{
  "en": [ ...updated english paragraphs, same count as input... ],
  "tr": [ ...updated turkish paragraphs, same count as input... ],
  "words": {{ ...updated interactive vocabulary mapping... }}
}}
"""

    models = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3-flash-preview", "gemini-2.5-flash-lite", "gemini-2.5-flash"]
    headers = {"Content-Type": "application/json"}
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
        
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=90) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                    refined = json.loads(text_content.strip())
                    
                    # Basic validation
                    if "en" in refined and "tr" in refined and "words" in refined:
                        if len(refined["en"]) == len(story_data["en"]) and len(refined["tr"]) == len(story_data["tr"]):
                            print(f"  [Refiner] Success! Story refined for level {level} using {model}.", flush=True)
                            return refined
                    print("  [Refiner Warning] Invalid response structure from Gemini. Retrying...", flush=True)
            except Exception as e:
                err_str = str(e)
                body = ""
                if hasattr(e, 'read'):
                    try:
                        body = e.read().decode("utf-8")
                    except:
                        pass
                
                is_quota = "quota" in err_str.lower() or "quota" in body.lower() or "limit" in body.lower() or "exhausted" in body.lower()
                
                if "429" in err_str:
                    if is_quota:
                        print(f"  [Refiner Warning] Model {model} quota exhausted. Switching to next model...", flush=True)
                        break
                    else:
                        print(f"  [Refiner Warning] Model {model} rate limited (429). Sleeping 30s (Attempt {attempt+1}/3)...", flush=True)
                        time.sleep(30)
                else:
                    print(f"  [Refiner Warning] Attempt {attempt+1} with model {model} failed: {e}. Sleeping 10s...", flush=True)
                    time.sleep(10)
        print(f"  [Refiner Warning] Model {model} failed all attempts or quota exhausted. Trying next model...", flush=True)
                    
    print("  [Refiner Error] Failed to refine story. Falling back to original story text.", flush=True)
    return story_data
