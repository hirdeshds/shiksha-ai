from fastapi import APIRouter
from app.schemas.question import QuestionRequest
from app.services.ai_service import generate_answer
from app.schemas.quiz import QuizRequest
from app.services.quiz_service import generate_quiz

router = APIRouter()

@router.post("/ask")
def ask_question(data: QuestionRequest):

    answer = generate_answer(
        data.question,
        data.language,
        data.grade
    )

    return {
        "success": True,
        "answer": answer
    }

@router.post("/quiz")
def create_quiz(data: QuizRequest):

    quiz = generate_quiz(data.topic)

    return {
        "success": True,
        "quiz": quiz
    }