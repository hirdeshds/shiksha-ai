import json
from app.core.cohere_client import co

def parse_command(text):

    prompt = f"""
You are an AI assistant for teachers.

Analyze this voice command:

{text}

Extract:

1. intent (explain or quiz)
2. topic
3. grade
4. language

Return ONLY valid JSON.

Example:

{{
    "intent": "explain",
    "topic": "photosynthesis",
    "grade": "6",
    "language": "Hindi"
}}
"""

    response = co.chat(
        model="command-a-plus-05-2026",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    for item in response.message.content:
        if item.type == "text":
            try:
                return json.loads(item.text)
            except Exception:
                return {
                    "intent": "explain",
                    "topic": text,
                    "grade": "6",
                    "language": "English"
                }

    return {
        "intent": "explain",
        "topic": text,
        "grade": "6",
        "language": "English"
    }