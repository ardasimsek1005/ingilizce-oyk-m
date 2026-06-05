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
    # --- CEFR A1 Level (10 Stories) ---
    {"id": "daily_market", "title": "A Day at the Market", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Shopping for fresh fruits and vegetables at a local market."},
    {"id": "daily_cafe", "title": "Coffee and Conversation", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Ordering drinks and snacks in a cozy neighborhood cafe."},
    {"id": "daily_taxi", "title": "The Taxi Ride", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Taking a taxi and giving simple street directions to the driver."},
    {"id": "daily_hotel", "title": "Checking In", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Registering at a hotel reception desk and asking about amenities."},
    {"id": "daily_park", "title": "Meeting in the Park", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Simple greetings, introductions, and talking about hobbies in a sunny park."},
    {"id": "daily_library", "title": "Finding a Book", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Asking a librarian for assistance and borrowing library books."},
    {"id": "daily_bus", "title": "Missing the Bus", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Using public transportation and asking others about bus schedule times."},
    {"id": "daily_weather", "title": "Planning a Picnic", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Discussing the daily weather forecast and choosing what clothes to wear."},
    {"id": "daily_pet", "title": "Choosing a Pet", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Talking about different animals and personal preferences at a pet shelter."},
    {"id": "daily_cooking", "title": "Dinner Time", "author": "Antigravity", "level": "A1", "cover": "/covers/daily_a1.webp", "desc": "Simple kitchen conversation and cooking basic recipes together."},

    # --- CEFR A2 Level (10 Stories) ---
    {"id": "daily_apartment", "title": "Renting a Flat", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Meeting a landlord, viewing rooms, and discussing monthly rental details."},
    {"id": "daily_airport", "title": "Heathrow Arrival", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Going through customs, declaring goods, and reclaiming luggage at the airport."},
    {"id": "daily_doctor", "title": "The Doctor's Visit", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Explaining simple physical symptoms and receiving medical recommendations."},
    {"id": "daily_shopping", "title": "Mall Shopping", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Asking shop assistants for clothing sizes and returning a purchased shirt."},
    {"id": "daily_interview", "title": "The Job Interview", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "A basic interview, introducing yourself, and asking about weekly working hours."},
    {"id": "daily_bank", "title": "Opening an Account", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Setting up a checking account and asking about bank cards at a local branch."},
    {"id": "daily_dentist", "title": "Toothache Trouble", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Scheduling a dentist appointment and explaining a sudden toothache."},
    {"id": "daily_train", "title": "Ticket Office", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Booking train tickets, asking about seat reservations and platform departures."},
    {"id": "daily_restaurant", "title": "The Birthday Dinner", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Celebrating at a restaurant, ordering meals, and splitting the bill."},
    {"id": "daily_laundry", "title": "Lost Sock", "author": "Antigravity", "level": "A2", "cover": "/covers/daily_a2.webp", "desc": "Using a local laundromat and explaining a washing machine issue."},

    # --- CEFR B1 Level (10 Stories) ---
    {"id": "daily_meeting", "title": "Project Planning", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "An intermediate office meeting brainstorming project ideas and giving feedback."},
    {"id": "daily_car_rent", "title": "Road Trip Car", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Renting an automobile for a vacation and discussing insurance coverages."},
    {"id": "daily_gym", "title": "Personal Trainer", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Setting fitness targets and designing a personalized exercise regimen."},
    {"id": "daily_mechanic", "title": "Car Breakdown", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Explaining unusual car engine noises and repair costs to a mechanic."},
    {"id": "daily_museum", "title": "Guided Tour", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Attending a museum guide session and asking questions about historic artifacts."},
    {"id": "daily_colleague", "title": "Lunch Break", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Chatting with coworkers about weekend plans, hobbies, and office news."},
    {"id": "daily_pharmacy", "title": "Prescription Help", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Consulting a pharmacist about prescription side effects and daily dosages."},
    {"id": "daily_university", "title": "Dormitory Move", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Moving into university housing, meeting roommates, and establishing rules."},
    {"id": "daily_barber", "title": "Haircut Choice", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Explaining a specific haircut style and conversing with a friendly barber."},
    {"id": "daily_cinema", "title": "Movie Choice", "author": "Antigravity", "level": "B1", "cover": "/covers/daily_b1.webp", "desc": "Picking a cinema movie, comparing film reviews, and buying snacks."},

    # --- CEFR B2 Level (10 Stories) ---
    {"id": "daily_investor", "title": "Pitching the Startup", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Presenting a business model to startup investors, asking for venture capital."},
    {"id": "daily_complaint", "title": "Faulty Laptop", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Negotiating with a retail manager for a refund on a defective laptop computer."},
    {"id": "daily_negotiation", "title": "Salary Review", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "A negotiation with a manager requesting a compensation raise with data."},
    {"id": "daily_wedding", "title": "Planning the Big Day", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "A dialogue discussing wedding catering options, venues, and overall budgets."},
    {"id": "daily_promotion", "title": "Promotion Talk", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Discussing promotion requirements and leadership goals with an HR manager."},
    {"id": "daily_contract", "title": "Signing the Lease", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Reviewing rental lease agreement terms and raising clauses for correction."},
    {"id": "daily_accident", "title": "Fender Bender", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Exchanging insurance credentials politely after a minor road accident."},
    {"id": "daily_career", "title": "Career Change", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Seeking guidance from a professional career counselor about changing industries."},
    {"id": "daily_apartment_issue", "title": "Water Leak", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Handling a sudden ceiling water leak with a neighbor and the building manager."},
    {"id": "daily_presentation", "title": "Stage Fright", "author": "Antigravity", "level": "B2", "cover": "/covers/daily_b2.webp", "desc": "Practicing an executive presentation and receiving constructive delivery advice."},

    # --- CEFR C1 Level (10 Stories) ---
    {"id": "daily_merger", "title": "Business Merger", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "Negotiating corporate merger strategies, discussing stock shares and stakes."},
    {"id": "daily_court", "title": "The Witness Stand", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "Providing a formal testimonial statement in court under questioning."},
    {"id": "daily_panel", "title": "Climate Debate", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "Participating in a panel discussion regarding renewable resources policy."},
    {"id": "daily_negotiate_lease", "title": "Commercial Rent", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "Negotiating a commercial property lease contract for retail space."},
    {"id": "daily_critic", "title": "Art Gallery", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "Analyzing and criticizing contemporary artworks at an exclusive exhibition."},
    {"id": "daily_crisis", "title": "Public Relations", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "A high-stakes PR meeting handling a corporate reputation issue and media release."},
    {"id": "daily_heritage", "title": "Family Inheritance", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "A consultation with a trust attorney discussing estate planning and wills."},
    {"id": "daily_interview_exec", "title": "Executive Interview", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "An advanced leadership interview focusing on corporate vision and strategy."},
    {"id": "daily_philosophy", "title": "Late Night Debate", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "An intellectual debate between friends regarding technological ethics and society."},
    {"id": "daily_academic", "title": "Research Proposal", "author": "Antigravity", "level": "C1", "cover": "/covers/daily_c1.webp", "desc": "Presenting and defending a scientific thesis proposal to a university academic board."}
]

DATA_FILE = "daily_stories_data.json"

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
                        "description": "3 paragraphs of the story/scenario in English, about 110-160 words each. Write in a narrative story style that naturally includes natural dialogues."
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
                print(f"  Attempt {attempt + 1} failed: {e}. Sleeping for 10 seconds...")
                time.sleep(10)
    return None

print(f"Starting/resuming generation of 50 Daily Conversation & Scenario stories...")
for idx, story in enumerate(STORIES_TO_GENERATE):
    s_id = story["id"]
    if s_id in expanded_data:
        print(f"[{idx+1}/50] Skipping {story['title']} (Already generated)")
        continue
        
    print(f"[{idx+1}/50] Generating {story['title']} (Level: {story['level']})...")
    
    story_en_paragraphs = []
    story_tr_paragraphs = []
    story_words = {}
    
    level_guidelines = ""
    if story["level"] == "A1":
        level_guidelines = "Ensure the grammar and vocabulary are extremely simple, suitable for absolute beginners (CEFR A1 level). Use simple present tense, basic sentences, and high-frequency everyday vocabulary. Avoid complex clauses or advanced idioms. Write simple, direct dialogues."
    elif story["level"] == "A2":
        level_guidelines = "Ensure the grammar and vocabulary are simple, suitable for CEFR A2 elementary level language learners. Use basic sentence structures, everyday language, simple past or present tenses, and clear conversational dialogues."
    elif story["level"] == "B1":
        level_guidelines = "Ensure the grammar and vocabulary are suitable for CEFR B1 intermediate level language learners. Use everyday conversational English, some phrasal verbs, and descriptive narrative sentences. Dialogue should feel natural, containing intermediate vocabulary."
    elif story["level"] == "B2":
        level_guidelines = "Ensure the grammar and vocabulary are suitable for CEFR B2 upper-intermediate level language learners. Use advanced everyday vocabulary, corporate/professional context words, phrasal verbs, idioms, and complex sentence structures with natural adult dialogues."
    elif story["level"] == "C1":
        level_guidelines = "Ensure the grammar and vocabulary are suitable for CEFR C1 advanced level language learners. Use highly formal, academic, corporate/legal professional words, complex narrative patterns, advanced idioms, precise terminology, and native-level nuanced conversations."

    sys_instruction = f"You are a professional literary author and English language teacher. You write engaging short stories for English learners at the CEFR {story['level']} level. {level_guidelines} Your target word count for the entire story is around 1800 to 2200 words. You will write the story across 5 chapters/parts. Crucial rule: The story MUST be written in a narrative story-telling format (it has descriptive action, narrative sentences, and paragraphs) but the main events and character actions must revolve around the everyday life scenario of '{story['desc']}' and naturally contain realistic dialogues matching the scenario."
    
    success = True
    chapter = 1
    while chapter <= 5:
        print(f"  Generating Chapter {chapter}/5...")
        prompt = f"Write Chapter {chapter} of the story/scenario '{story['title']}'. This chapter should consist of exactly 3 paragraphs, with each paragraph being about 110-150 words in length. {level_guidelines} Maintain the narrative style and scenario flow. Also provide a beautiful and contextually accurate Turkish translation for each paragraph, and extract 6 key vocabulary words from this chapter (base lowercase English forms and their Turkish meaning in this context). Crucial rule: Do NOT include any chapter numbers, chapter headers, or title prefixes (like 'Chapter X', 'Part X', 'Bölüm X') in the paragraphs. Start writing the story text directly."
        if chapter > 1:
            prompt += f"\n\nContext of previous chapters:\n" + "\n".join(story_en_paragraphs[-3:])
            
        result = call_gemini(prompt, sys_instruction)
        
        if result is None:
            print("  Persistent rate limit or error encountered. Sleeping for 90 seconds before retrying this part...")
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
        time.sleep(2) # delay to avoid rate limits
            
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
        "coverUrl": story["cover"],
        "en": story_en_paragraphs,
        "tr": story_tr_paragraphs,
        "words": story_words
    }
    
    word_count = sum(len(p.split()) for p in story_en_paragraphs)
    print(f"  Success! Total paragraphs: {len(story_en_paragraphs)}, words: {word_count}, vocabulary words: {len(story_words)}.")
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(expanded_data, f, indent=2, ensure_ascii=False)
        
    time.sleep(2)

print("Story generation completed successfully!")
