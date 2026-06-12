from app.core.cohere_client import co
import json

def generate_quiz(topic):

    prompt = f"""
    Create 3 multiple choice questions on:

    {topic}

    Return ONLY valid JSON.

    Example:

    [
      {{
        "question":"What is photosynthesis?",
        "options":["A","B","C","D"],
        "correct":"A"
      }}
    ]
    """

    response = co.chat(
        model="command-a-plus-05-2026",
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )

    for item in response.message.content:
        if item.type == "text":
            return item.text

    return "[]"