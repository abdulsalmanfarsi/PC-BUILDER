import concurrent.futures
import datetime
from price_extractor import IndianPriceExtractor

def search_web(tavily_client, query, max_results=4):
    """Actually performs the web search via Tavily."""
    try:
        response = tavily_client.search(query, max_results=max_results)
        results = response.get("results", [])
        if not results:
            return "No search results found for this query."
        formatted = ""
        for r in results:
            formatted += f"Title: {r['title']}\nContent: {r['content']}\nURL: {r['url']}\n\n"
        return formatted
    except Exception as e:
        return f"Search failed (error: {e}). Please answer using whatever information you already have, and mention that live search wasn't available."


def compare_parts(tavily_client, parts, current_year):
    """Runs a separate, focused search for each part (max 3), IN PARALLEL."""
    if len(parts) > 3:
        parts = parts[:3]

    def search_one(part):
        search_query = f"{part} price specs benchmarks {current_year}"
        result = search_web(tavily_client, search_query, max_results=3)
        return f"=== {part} ===\n{result}\n\n"

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        results = list(executor.map(search_one, parts))

    return "".join(results)


def generate_builds(
    tavily_client,
    budget,
    use_case,
    existing_parts=None,
    region="",
    current_year=None
):
    """
    Generates build with VERIFIED prices - no guessing allowed.
    """
    
    if current_year is None:
        current_year = str(datetime.date.today().year)
    
    use_case_focus = {
        "gpu_heavy": "gaming and GPU-intensive workloads",
        "cpu_heavy": "video editing and content creation",
        "casual": "daily use and general computing"
    }
    
    focus_description = use_case_focus.get(use_case, "general PC build")
    region_hint = region.strip() if region else "India"
    
    # Get search results for build
    search_query = (
        f"best {focus_description} PC build {budget} INR {current_year} "
        f"CPU GPU motherboard RAM SSD PSU prices {region_hint}"
    )
    result = search_web(tavily_client, search_query, max_results=8)
    
    # Extract verified prices for each component
    price_extractor_local = IndianPriceExtractor()
    component_prices = {}
    
    # List of components to check
    components_to_check = ["CPU", "GPU", "Motherboard", "RAM", "SSD", "PSU", "Case"]
    
    for comp in components_to_check:
        comp_query = f"{comp} price {budget} build {current_year} {region_hint}"
        comp_result = search_web(tavily_client, comp_query, max_results=3)
        price_data = price_extractor_local.get_best_price(f"{comp} component", comp_result)
        
        if price_data and price_data.get("best_price"):
            component_prices[comp] = {
                "price": price_data["best_price"],
                "retailer": price_data.get("best_retailer", "unknown")
            }
    
    # =============================================
    # CRITICAL: Calculate total from verified prices
    # =============================================
    verified_total = 0
    price_lines = []
    
    for comp, data in component_prices.items():
        price_lines.append(f"{comp}: ₹{data['price']:,.2f} (from {data['retailer']})")
        verified_total += data["price"]
    
    # Format the budget for comparison
    budget_clean = float(budget.replace('₹', '').replace(',', '').strip())
    
    # Build the response that Gemini will use
    price_summary = "\n\n" + "=" * 60 + "\n"
    price_summary += "VERIFIED COMPONENT PRICES - USE THESE EXACT PRICES\n"
    price_summary += "=" * 60 + "\n"
    
    if price_lines:
        price_summary += "\n".join(price_lines)
        price_summary += f"\n\n✅ SUM OF VERIFIED PRICES: ₹{verified_total:,.2f}"
        
        if verified_total <= budget_clean:
            price_summary += f"\n✅ Within budget of {budget}"
        else:
            price_summary += f"\n⚠️ EXCEEDS budget by ₹{verified_total - budget_clean:,.2f} - adjust components"
    else:
        price_summary += "⚠️ No verified prices found. Do NOT guess prices.\n"
        price_summary += "Use approximate prices ONLY if clearly marked as estimates.\n"
    
    price_summary += "=" * 60 + "\n"
    
    return f"""
CURRENT MARKET SEARCH RESULTS

Budget: {budget}
Market: {region_hint}
Use case: {focus_description}
Date: {current_year}

SEARCH RESULTS:
{result}

{price_summary}

🚨 CRITICAL INSTRUCTION FOR ESTIMATED TOTAL:
1. The Estimated Total MUST be exactly: ₹{verified_total:,.2f} (the sum of verified prices above)
2. Do NOT guess, round, or invent a different total.
3. If any component lacks a verified price, state "Price not verified" for that component.
4. All prices in Indian Rupees (₹).
5. Component selection should stay within the budget: {budget}.
"""


def verify_component_prices(
    tavily_client,
    components,
    region="",
    current_year=None
):
    """Verifies current prices using Tavily search with structured extraction."""
    
    if current_year is None:
        current_year = str(datetime.date.today().year)
    
    if not components:
        return "No components provided for price verification."
    
    components = components[:8]
    price_extractor_local = IndianPriceExtractor()
    
    results = []
    
    for component in components:
        query = f'"{component}" price {region} {current_year}'
        result = search_web(tavily_client, query, max_results=5)
        price_data = price_extractor_local.get_best_price(component, result)
        
        if price_data and price_data.get("best_price"):
            results.append({
                "component": component,
                "best_price": price_data["best_price"],
                "retailer": price_data.get("best_retailer", "unknown"),
                "prices": price_data.get("prices", [])[:3],
                "success": True
            })
        else:
            results.append({
                "component": component,
                "success": False,
                "error": "Price not found"
            })
    
    formatted = "COMPONENT PRICE VERIFICATION:\n\n"
    
    for r in results:
        if r["success"]:
            formatted += f"✅ {r['component']}: ₹{r['best_price']:,.2f} at {r['retailer']}\n"
        else:
            formatted += f"❌ {r['component']}: {r.get('error', 'Not found')}\n"
    
    formatted += "\nUse these verified prices in the Estimated Total."
    
    return formatted


# Initialize at module level
price_extractor = IndianPriceExtractor()