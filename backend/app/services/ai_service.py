import json
from app.core.cohere_client import co

def explain_topic(topic, language, grade):

    prompt = f"""
You are a teaching assistant in a Haryana government school.
Create a structured explanation for the topic: {topic}
Class/Grade level: {grade}
Language: {language}

Rules:
- If language is Hindi, output entirely in Hindi Devanagari script.
- If language is English, output ENTIRELY in English. DO NOT use any Hindi or Hinglish words.
- If language is Hinglish, mix Hindi and English naturally (e.g., use English/Latin script but mix Hindi and English words naturally, just like spoken Hinglish).
- Make sure the content difficulty and vocabulary are suitable for Class {grade} students.
- Keep descriptions and definitions short and clear.

Return JSON only.

Format:
{{
  "title": "A short, engaging title explaining the topic",
  "concept": "A simple paragraph explaining the concept (under 80 words)",
  "Similarity": "A relatable real-life Similarity to understand the concept (under 30 words)",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "vocabulary": [
    {{
      "word": "Term 1",
      "definition": "Simple definition of Term 1"
    }},
    {{
      "word": "Term 2",
      "definition": "Simple definition of Term 2"
    }}
  ],
  "fun_fact": "An interesting fun fact about the topic"
}}
"""

    response = co.chat(
        model="command-a-plus-05-2026",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    for item in response.message.content:
        if item.type == "text":
            try:
                raw_text = item.text
                start_idx = raw_text.find('{')
                end_idx = raw_text.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    json_str = raw_text[start_idx:end_idx+1]
                    return json.loads(json_str)
                return json.loads(raw_text)
            except Exception as e:
                print(f"Error parsing explanation JSON: {e}")
                print(f"Raw output: {item.text}")

    return {
        "title": f"{topic} Explained",
        "concept": "Sorry, we could not generate a structured explanation for this topic at this time.",
        "Similarity": "N/A",
        "key_points": [],
        "vocabulary": [],
        "fun_fact": "N/A"
    }