import re
import json
from groq import Groq
from config import GROQ_API_KEY, TAVILY_API_KEY, SYSTEM_PROMPT
from tools import search_web, compare_parts, generate_builds, verify_component_prices

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "openai/gpt-oss-120b"
GLOBAL_CACHE = {"prices": []}

TOOLS = [
    # ... (Keep your TOOLS list exactly as it is) ...
]

def run_conversation(tavily_client, history, question, country="", currency=""):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history[-4:]:
        if msg.get("role") in ["user", "assistant"]:
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": question})

    search_log = []
    answer = None

    for round_num in range(4):
        try:
            # Do NOT force a tool choice. Let the AI decide.
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto", 
                temperature=0.2,
                max_tokens=1500
            )
        except Exception as e:
            print(f"Groq Error: {e}")
            break

        msg = response.choices[0].message

        if msg.tool_calls:
            messages.append(msg)
            for tc in msg.tool_calls:
                name = tc.function.name
                args = json.loads(tc.function.arguments)
                res = "Error"

                if name == "search_web":
                    res = search_web(tavily_client, args.get("query", ""))
                elif name == "generate_builds":
                    res = generate_builds(tavily_client, args.get("budget",""), args.get("use_case",""), region=country, currency=currency)
                elif name == "verify_component_prices":
                    res = verify_component_prices(tavily_client, args.get("components",[]), region=country, currency=currency)
                    GLOBAL_CACHE["prices"] = res.get("results", [])

                search_log.append(f"Called {name}")
                messages.append({"role": "tool", "tool_call_id": tc.id, "name": name, "content": json.dumps(res)})
        else:
            answer = msg.content
            break

    # --- Force Final Answer if AI got stuck in a loop ---
    if not answer:
        try:
            final_resp = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages + [{"role": "user", "content": "Provide the final [BUILD] block now."}],
                temperature=0.2
            )
            answer = final_resp.choices[0].message.content
        except:
            answer = "I couldn't generate a response from the AI."

    # --- Python Interceptor (Only runs if AI found prices) ---
    real_prices = GLOBAL_CACHE.get("prices", [])
    if real_prices and any(p.get("success") for p in real_prices):
        lines = ["[BUILD]", "Name: Live Verified Build", "Use Case: gaming"]
        total = 0
        count = 0
        for p in real_prices:
            if p.get("success"):
                n = p['component'].lower()
                cat = "Component"
                if "ryzen" in n or "intel" in n: cat = "CPU"
                elif "rtx" in n or "radeon" in n: cat = "GPU"
                elif "b550" in n or "b650" in n or "b760" in n: cat = "Motherboard"
                elif "ddr" in n: cat = "RAM"
                elif "ssd" in n: cat = "Storage"
                elif "psu" in n or "watt" in n: cat = "PSU"
                elif "cooler" in n: cat = "Cooler"
                elif "case" in n: cat = "Case"
                
                lines.append(f"{cat}: {p['exact_title'][:50]}... | Price: ₹{p['best_price']:,.0f} | Link: {p['url']}")
                total += p['best_price']
                count += 1
        if count > 0:
            lines.append(f"Estimated Total: ₹{total:,.0f}")
            lines.append("[/BUILD]")
            answer = "\n".join(lines)
            answer += "\n\n*(Prices verified live by the Python engine.)*"

    # Final fallback
    if not answer or "Error generating response" in answer:
        answer = "I couldn't generate a response. Please try a different prompt."

    history.append({"role": "user", "content": question})
    history.append({"role": "assistant", "content": answer})
    return {"answer": answer, "history": history, "search_log": search_log}