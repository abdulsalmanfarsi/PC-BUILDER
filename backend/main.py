"""
FastAPI server - PC Builder API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from tavily import TavilyClient

from config import TAVILY_API_KEY, SYSTEM_PROMPT, CURRENT_YEAR
from core_engine import run_conversation
from tools import search_web, price_extractor

app = FastAPI(title="PC Builder API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tavily Client
tavily_client = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None

# Request Models
class AskRequest(BaseModel):
    question: str
    history: Optional[list] = None
    country: str = ""
    currency: str = ""

class PriceCheckRequest(BaseModel):
    components: List[str]
    country: str = ""
    currency: str = ""

# Endpoints
@app.api_route("/", methods=["GET", "HEAD"])
def health_check():
    return {
        "status": "PC Builder API is running",
        "version": "2.0.0"
    }

@app.post("/ask")
def ask(request: AskRequest):
    """Main AI conversation endpoint"""
    history = request.history if request.history else [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    result = run_conversation(
        tavily_client=tavily_client,
        history=history,
        question=request.question,
        country=request.country,
        currency=request.currency,
    )
    
    return result

@app.post("/verify-prices")
async def verify_prices(request: PriceCheckRequest):
    """Get prices using Tavily search"""
    if not tavily_client:
        raise HTTPException(status_code=503, detail="Tavily client not available")
    
    results = []
    for component in request.components:
        query = f'"{component}" price {request.country}'
        search_result = search_web(tavily_client, query, max_results=5)
        price_data = price_extractor.get_best_price(component, search_result)
        
        if price_data.get("best_price"):
            results.append({
                "component": component,
                "best_price": price_data["best_price"],
                "best_retailer": price_data.get("best_retailer", "unknown"),
                "prices": price_data.get("prices", []),
                "success": True
            })
        else:
            results.append({
                "component": component,
                "success": False,
                "error": "No prices found"
            })
    
    return {
        "status": "success",
        "count": len(results),
        "country": request.country,
        "currency": request.currency,
        "results": results
    }