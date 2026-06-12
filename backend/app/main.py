from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="ShikshaAI"
)

app.include_router(router)

@app.get("/")
def home():
    return {
        "message":"ShikshaAI Backend Running"
    }