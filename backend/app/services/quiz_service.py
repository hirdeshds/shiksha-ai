from app.core.cohere_client import co

def generate_quiz(topic):

    prompt = f"""
Generate 5 MCQs about:

{topic}

Return JSON only.

Format:

{{
 "questions":[
   {{
      "question":"",
      "options":["","","",""],
      "answer":""
   }}
 ]
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
            return item.text

    return "{}"