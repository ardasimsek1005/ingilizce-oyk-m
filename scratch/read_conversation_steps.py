import json

log_path = r"C:\Users\acer\.gemini\antigravity\brain\3ab92cab-5bde-4ef2-9f27-c00d7f8581f2\.system_generated\logs\transcript.jsonl"

search_terms = ["can", "antigravity", "yazar", "silme", "pratik", "rastgele"]

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                created_at = data.get("created_at", "")
                # Today: June 5, 2026 or June 4, 2026
                if "2026-06-05" in created_at or "2026-06-04" in created_at:
                    t = data.get("type", "")
                    if t == "USER_INPUT":
                        content = data.get("content", "").lower()
                        if any(term in content for term in search_terms):
                            print(f"[{created_at}] USER: {data.get('content', '').strip()}")
                            print("-" * 50)
            except Exception as e:
                pass
except Exception as e:
    print("Error reading log:", e)
