import json
from app.core.cohere_client import co

def generate_quiz(topic, language, grade):

    prompt = f"""
You are a teaching assistant in a Haryana government school.
Generate 5 MCQs about the topic: {topic}
Class/Grade level: {grade}
Language: {language}

Rules:
- If language is Hindi, generate the questions, options, and answer entirely in Hindi Devanagari script.
- If language is English, generate the questions, options, and answer ENTIRELY in English. DO NOT use any Hindi or Hinglish words.
- If language is Hinglish, mix Hindi and English naturally (e.g., use English/Latin script but mix Hindi and English words naturally, just like spoken Hinglish).
- Make sure the content difficulty and vocabulary are suitable for Class {grade}.
- Provide exactly 4 options for each question.
- The "answer" field must contain the exact string matching one of the options.

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

    print(f"PROMPT SENT TO COHERE:\n{prompt}")

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

    # Removed print of raw response to avoid UnicodeEncodeError in console

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