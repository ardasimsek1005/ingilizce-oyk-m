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

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
    
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                text_content = res_json["candidates"][0]["content"]["parts"][0]["text"]
                refined = json.loads(text_content.strip())
                
                # Basic validation
                if "en" in refined and "tr" in refined and "words" in refined:
                    if len(refined["en"]) == len(story_data["en"]) and len(refined["tr"]) == len(story_data["tr"]):
                        print(f"  [Refiner] Success! Story refined for level {level}.")
                        return refined
                print("  [Refiner Warning] Invalid response structure from Gemini. Retrying...")
        except Exception as e:
            err_str = str(e)
            if "429" in err_str:
                print(f"  [Refiner Warning] Rate limited (429). Sleeping 30s (Attempt {attempt+1}/5)...")
                time.sleep(30)
            else:
                print(f"  [Refiner Warning] Attempt {attempt+1} failed: {e}. Sleeping 10s...")
                time.sleep(10)
                
    print("  [Refiner Error] Failed to refine story. Falling back to original story text.")
    return story_data
