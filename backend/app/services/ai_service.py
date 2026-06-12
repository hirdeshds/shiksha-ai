from app.core.cohere_client import co

def generate_answer(question, language, grade):

    prompt = f"""
    You are an AI teacher for government school students.

    Explain the following question for a Class {grade} student.

    Language: {language}

    Question:
    {question}

    Rules:
    - Use simple language
    - Give examples
    - Keep answer under 200 words
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