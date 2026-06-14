from app.core.cohere_client import co

def explain_topic(topic, language, grade):

    prompt = f"""
    You are a teaching assistant in a Haryana government school.

    Topic: {topic}
    Class: {grade}
    Language: {language}

    Rules:
    - If language is Hindi, answer in Hindi.
    - If language is English, answer in English.
    - If language is Hinglish, mix Hindi and English naturally.
    - Use simple language.
    - Use classroom examples.
    - Keep answer under 150 words.
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

    return "No response generated."