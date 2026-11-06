from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from tavily import TavilyClient

from config import TAVILY_API_KEY
from core_engine import run_conversation

app = FastAPI(title="PC Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None

class AskRequest(BaseModel):
    question: str
    history: Optional[list] = None
    country: str = ""
    currency: str = ""

@app.api_route("/", methods=["GET", "HEAD"])
def health_check():
    return {"status": "PC Builder API is running"}

@app.post("/ask")
def ask(request: AskRequest):
    history = request.history if request.history else []
    return run_conversation(
        tavily_client=tavily_client,
        history=history,
        question=request.question,
        country=request.country,
        currency=request.currency,
    )