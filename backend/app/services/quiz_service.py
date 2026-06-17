import json
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
                print(f"Error parsing quiz JSON: {e}")
                print(f"Raw output: {item.text}")
                return {"questions": []}

    return {"questions": []}