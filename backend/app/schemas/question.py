from pydantic import BaseModel

class ExplainRequest(BaseModel):
    topic: str
    language: str
    grade: str