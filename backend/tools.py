import concurrent.futures
import datetime
import threading
import time
from typing import Any, Dict, List, Optional

from price_extractor import IndianPriceExtractor


# Short-lived in-process cache for Tavily results.
# This prevents repeated identical searches from consuming another network call.
_SEARCH_CACHE: Dict[str, Dict[str, Any]] = {}
_SEARCH_CACHE_LOCK = threading.Lock()
_SEARCH_CACHE_TTL_SECONDS = 6 * 60 * 60


def _cache_key(query: str, max_results: int) -> str:
    return f"{query.strip().lower()}::{max_results}"


def search_web(tavily_client, query, max_results=4):
    """Search Tavily and return compact JSON-safe results."""
    query = (query or "").strip()
    if not query:
        return {
            "success": False,
            "query": "",
            "error": "No search query was provided.",
            "results": [],
        }

    if not tavily_client:
        return {
            "success": False,
            "query": query,
            "error": "Tavily client is not configured.",
            "results": [],
        }

    key = _cache_key(query, max_results)
    now = time.time()

    with _SEARCH_CACHE_LOCK:
        cached = _SEARCH_CACHE.get(key)
        if cached and now - cached["timestamp"] < _SEARCH_CACHE_TTL_SECONDS:
            return cached["data"]
        if cached:
            _SEARCH_CACHE.pop(key, None)

    try:
        response = tavily_client.search(query, max_results=max_results)
        results = response.get("results", []) or []
        compact_results = []

        for r in results:
            title = str(r.get("title", "")).strip()
            url = str(r.get("url", "")).strip()
            content = str(r.get("content", "")).strip()
            compact_results.append({
                "title": title[:180],
                "url": url,
                "content": content[:700],
            })

        data = {
            "success": True,
            "query": query,
            "results": compact_results,
        }

        with _SEARCH_CACHE_LOCK:
            _SEARCH_CACHE[key] = {"timestamp": now, "data": data}
        return data

    except Exception as e:
        return {
            "success": False,
            "query": query,
            "error": f"Tavily search failed: {e}",
            "results": [],
        }


def compare_parts(tavily_client, parts, current_year, region="", currency=""):
    """Run focused searches for each part in parallel."""
    if len(parts) > 3:
        parts = parts[:3]

    def search_one(part):
        search_query = f"{part} price specs benchmarks {current_year}"
        if region:
            search_query += f" {region}"
        if currency:
            search_query += f" {currency}"
        result = search_web(tavily_client, search_query, max_results=3)
        return {
            "component": part,
            "search": result,
        }

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(3, len(parts))) as executor:
        results = list(executor.map(search_one, parts))

    return {
        "success": all(item["search"].get("success", False) for item in results),
        "type": "comparison_search",
        "results": results,
    }


def _owned_component_types(existing_parts: str) -> set:
    """Identify broad component categories already owned by the user."""
    text = (existing_parts or "").lower()
    patterns = {
        "CPU": ["cpu", "processor", "ryzen", "intel", "core i"],
        "GPU": ["gpu", "graphics", "rtx", "gtx", "radeon", "rx ", "arc"],
        "Motherboard": ["motherboard", "b550", "b650", "b760", "z790", "x570", "x670", "a620", "h610"],
        "RAM": ["ram", "memory", "ddr4", "ddr5"],
        "SSD": ["ssd", "nvme", "m.2"],
        "PSU": ["psu", "power supply"],
        "Cooler": ["cooler", "aio", "liquid cooler", "air cooler"],
        "Case": ["case", "cabinet", "chassis"],
    }
    return {
        component
        for component, keywords in patterns.items()
        if any(keyword in text for keyword in keywords)
    }


def generate_builds(
    tavily_client,
    budget,
    use_case,
    existing_parts=None,
    region="",
    currency="INR",
    current_year=None,
):
    """Gather current market research and verified category prices for a build."""

    if current_year is None:
        current_year = str(datetime.date.today().year)

    use_case_focus = {
        "gpu_heavy": "gaming and GPU-intensive workloads",
        "cpu_heavy": "video editing and content creation",
        "casual": "daily use and general computing",
    }

    focus_description = use_case_focus.get(use_case, "general PC build")
    region_hint = region.strip() if region else ""
    currency_hint = currency.strip() if currency else ""
    market_suffix = " ".join(x for x in [region_hint, currency_hint] if x)

    search_query = (
        f"best {focus_description} PC build {budget} {current_year} "
        f"CPU GPU motherboard RAM SSD PSU cooler case prices"
    )
    if market_suffix:
        search_query += f" {market_suffix}"
    if existing_parts:
        search_query += f" existing parts {existing_parts}"

    components_to_check = [
        "CPU", "GPU", "Motherboard", "RAM", "SSD", "PSU", "Cooler", "Case"
    ]
    owned_types = _owned_component_types(existing_parts or "")
    components_to_check = [c for c in components_to_check if c not in owned_types]

    # Run the broad market search and category searches concurrently.
    queries = [("market", search_query, 8)]
    for comp in components_to_check:
        comp_query = f"{comp} price {current_year}"
        if market_suffix:
            comp_query += f" {market_suffix}"
        queries.append((comp, comp_query, 3))

    def run_search(item):
        label, query, max_results = item
        return label, search_web(tavily_client, query, max_results=max_results)

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(9, len(queries))) as executor:
        search_pairs = list(executor.map(run_search, queries))

    search_map = dict(search_pairs)
    market_search = search_map.get("market", {
        "success": False,
        "query": search_query,
        "error": "Market search did not return.",
        "results": [],
    })

    extractor = IndianPriceExtractor()
    category_candidates = {}

    for comp in components_to_check:
        search_result = search_map.get(comp)
        if not search_result or not search_result.get("success"):
            continue
        candidates = extractor.get_market_candidates(
            search_result,
            component_type=comp,
            currency=currency_hint or "INR",
            limit=6,
        )
        if candidates:
            category_candidates[comp] = candidates

    # Only a compact market snapshot goes back to Gemini. Raw Tavily content
    # is deliberately not included here.
    market_references = []
    for item in market_search.get("results", [])[:6]:
        market_references.append({
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "snippet": item.get("content", "")[:300],
        })

    return {
        "success": True,
        "type": "build_market_research",
        "budget": budget,
        "market": region_hint or "Not specified",
        "currency": currency_hint or "Not specified",
        "use_case": focus_description,
        "date": current_year,
        "existing_parts": existing_parts or "",
        "owned_component_types": sorted(owned_types),
        "market_references": market_references,
        "component_candidates": category_candidates,
        "instruction": (
            "Use these compact current-market candidates to choose exact components. "
            "Do not treat category candidates as exact SKU price verification. "
            "After selecting exact SKUs, call verify_component_prices for those exact components."
        ),
    }


def verify_component_prices(
    tavily_client,
    components,
    region="",
    currency="INR",
    current_year=None,
):
    """Verify component prices using Tavily web search (no local scraper)."""
    if not components:
        return {"success": False, "results": [], "error": "No components provided."}

    components = components[:8]

    def verify_one(component):
        query = f'"{component}" price {region or "India"} {current_year or ""}'.strip()
        result = search_web(tavily_client, query, max_results=3)

        if not result.get("success") or not result.get("results"):
            return {
                "component": component,
                "success": False,
                "error": "No search results.",
            }

        # Find the first result that looks like a price
        import re
        for r in result["results"]:
            content = r.get("content", "")
            # Match ₹, Rs, INR followed by digits
            match = re.search(r'(?:₹|Rs\.?|INR)\s*([\d,]+)', content)
            if match:
                price = float(match.group(1).replace(",", ""))
                return {
                    "component": component,
                    "success": True,
                    "best_price": price,
                    "currency": "INR",
                    "retailer": "web",
                    "url": r.get("url", ""),
                    "exact_title": r.get("title", component)[:60],
                }

        return {"component": component, "success": False, "error": "No price found."}

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(8, len(components))) as executor:
        results = list(executor.map(verify_one, components))

    return {
        "success": any(r.get("success") for r in results),
        "type": "price_verification",
        "results": results,
    }