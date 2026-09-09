"""
FastAPI server - FREE version (no paid APIs)
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from tavily import TavilyClient
import asyncio

from config import TAVILY_API_KEY, SYSTEM_PROMPT, CURRENT_YEAR
from core_engine import run_conversation

# Try to import price aggregator, fallback if not available
try:
    from price_sources.aggregator import price_aggregator
    PRICE_AGGREGATOR_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Price aggregator not available: {e}")
    PRICE_AGGREGATOR_AVAILABLE = False

app = FastAPI(title="PC Builder API - Free Edition")

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
    country: str = "India"
    currency: str = "INR"

# Endpoints
@app.api_route("/", methods=["GET", "HEAD"])
def health_check():
    return {
        "status": "PC Builder API is running",
        "version": "2.0.0-free",
        "features": ["free_scraping", "indian_retailers", "pcpartpicker"],
        "price_aggregator": PRICE_AGGREGATOR_AVAILABLE
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
    """
    Get accurate prices using Tavily search + price extraction
    """
    from tools import verify_component_prices
    
    # Use Tavily to search for prices
    result = verify_component_prices(
        tavily_client=tavily_client,
        components=request.components,
        region=request.country,
        current_year=CURRENT_YEAR
    )
    
    # Parse the result to match the expected format
    # The result is a string with structured price info
    return {
        "status": "success",
        "data": result,
        "components": request.components,
        "source": "tavily"
    }


@app.post("/verify-prices-tavily")
def verify_prices_tavily(request: PriceCheckRequest):
    """
    Fallback: Use Tavily + LLM for price verification
    """
    if not tavily_client:
        return {"error": "Tavily API key not configured"}
    
    from tools import verify_component_prices
    result = verify_component_prices(
        tavily_client=tavily_client,
        components=request.components,
        region=request.country,
        current_year=CURRENT_YEAR
    )
    
    return {
        "status": "success",
        "data": result,
        "components": request.components,
        "source": "tavily_fallback"
    }

@app.get("/price-sources/stats")
def get_source_stats():
    """Get statistics for price sources"""
    return {
        "status": "success",
        "sources": {
            "free_scraper": {
                "status": "active" if PRICE_AGGREGATOR_AVAILABLE else "disabled",
                "type": "free",
                "sites": ["pcpartpicker", "mdcomputers", "vedant", "primeabgb", "computech"]
            }
        }
    }