"""
Price extraction and normalization for PC components.
Supports common global currencies while retaining India-specific GST handling.
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime


@dataclass
class PriceEntry:
    component: str
    retailer: str
    price: float
    currency: str = "INR"
    gst_inclusive: bool = True
    in_stock: bool = True
    url: str = ""
    timestamp: datetime = None
    match_confidence: float = 0.0

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


class IndianPriceExtractor:
    """Exact-product price extraction with India GST support and global currency parsing."""

    RETAILER_PATTERNS = {
        "amazon": {
            "patterns": [r'amazon\.in', r'amazon\.', r'amazon india', r'amazon'],
            "gst_inclusive": True,
        },
        "flipkart": {
            "patterns": [r'flipkart\.com', r'flipkart'],
            "gst_inclusive": True,
        },
        "mdcomputers": {
            "patterns": [r'mdcomputers\.in', r'md computers', r'mdcomputers'],
            "gst_inclusive": False,
        },
        "vedant": {
            "patterns": [r'vedantcomputers\.com', r'vedant computers', r'vedant'],
            "gst_inclusive": False,
        },
        "primeabgb": {
            "patterns": [r'primeabgb\.com', r'prime abgb', r'primeabgb'],
            "gst_inclusive": False,
        },
        "itdepot": {
            "patterns": [r'itdepot\.com', r'it depot', r'itdepot'],
            "gst_inclusive": False,
        },
        "elitehubs": {
            "patterns": [r'elitehubs\.com', r'elite hubs'],
            "gst_inclusive": False,
        },
        "pcstudio": {
            "patterns": [r'pcstudio\.in', r'pc studio'],
            "gst_inclusive": False,
        },
    }

    GST_RATES = {
        "cpu": 18, "gpu": 28, "motherboard": 18, "ram": 18,
        "ssd": 18, "hdd": 18, "psu": 18, "case": 18,
        "cooler": 18, "monitor": 18, "keyboard": 18, "mouse": 18,
        "other": 18,
    }

    CURRENCY_SYMBOLS = {
        "₹": "INR", "$": "USD", "€": "EUR", "£": "GBP",
        "¥": "JPY", "₽": "RUB", "₩": "KRW", "₺": "TRY",
        "A$": "AUD", "C$": "CAD", "S$": "SGD",
    }

    GENERIC_TERMS = {
        "cpu", "gpu", "graphics", "card", "processor", "component", "price",
        "motherboard", "board", "ram", "memory", "ssd", "nvme", "psu", "case",
        "cooler", "storage", "desktop", "pc", "computer", "new", "gaming",
        "edition", "black", "white", "retail", "box", "tray", "warranty",
    }

    PRICE_PATTERNS = [
        (r'₹\s*([\d,]+(?:\.\d{2})?)', "INR"),
        (r'Rs\.?\s*([\d,]+(?:\.\d{2})?)', "INR"),
        (r'INR\s*([\d,]+(?:\.\d{2})?)', "INR"),
        (r'\$\s*([\d,]+(?:\.\d{2})?)', "USD"),
        (r'USD\s*([\d,]+(?:\.\d{2})?)', "USD"),
        (r'€\s*([\d,]+(?:\.\d{2})?)', "EUR"),
        (r'EUR\s*([\d,]+(?:\.\d{2})?)', "EUR"),
        (r'£\s*([\d,]+(?:\.\d{2})?)', "GBP"),
        (r'GBP\s*([\d,]+(?:\.\d{2})?)', "GBP"),
        (r'¥\s*([\d,]+(?:\.\d{2})?)', "JPY"),
        (r'JPY\s*([\d,]+(?:\.\d{2})?)', "JPY"),
        (r'₩\s*([\d,]+(?:\.\d{2})?)', "KRW"),
        (r'KRW\s*([\d,]+(?:\.\d{2})?)', "KRW"),
    ]

    def __init__(self):
        self.seen_prices = set()

    def clean_price(self, price_str: str) -> Optional[float]:
        if not price_str:
            return None
        cleaned = re.sub(r'[\s,]', '', price_str)
        cleaned = re.sub(r'[^0-9.]', '', cleaned)
        if not cleaned or cleaned.count('.') > 1:
            return None
        try:
            price = float(cleaned)
        except ValueError:
            return None
        if price <= 0:
            return None
        return price

    # Backwards-compatible alias used by older code.
    clean_indian_price = clean_price

    def detect_retailer(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        url_match = re.search(r'(https?://[^\s]+)', text_lower)
        candidates = [url_match.group(1)] if url_match else []
        candidates.append(text_lower)
        title_match = re.search(r'Title:\s*([^\n]+)', text, re.IGNORECASE)
        if title_match:
            candidates.append(title_match.group(1).lower())

        for candidate in candidates:
            for retailer, info in self.RETAILER_PATTERNS.items():
                if any(re.search(pattern, candidate, re.IGNORECASE) for pattern in info["patterns"]):
                    return retailer
        return None

    def detect_component_type(self, component_name: str) -> str:
        name_lower = component_name.lower()
        type_patterns = {
            "cpu": ['intel', 'amd', 'ryzen', 'core i', 'processor', 'xeon', 'threadripper'],
            "gpu": ['rtx', 'radeon', 'geforce', 'gpu', 'graphics', 'gtx', 'rx ', 'arc'],
            "motherboard": ['b760', 'z790', 'b650', 'x670', 'motherboard', 'a620', 'h610', 'b550', 'x570'],
            "ram": ['ddr', 'ram', 'memory', 'vengeance', 'trident', 'ballistix', 'fury'],
            "ssd": ['ssd', 'nvme', 'm.2', 'sata', 'crucial', 'samsung', 'wd'],
            "hdd": ['hdd', 'barracuda', 'ironwolf', 'hard drive'],
            "psu": ['power supply', 'psu', 'corsair rm', 'seasonic', 'super flower'],
            "case": ['case', 'cabinet', 'chassis', 'corsair 4000', 'nzxt', 'lian li'],
            "cooler": ['cooler', 'aio', 'liquid cooler', 'air cooler', 'noctua', 'deepcool'],
            "monitor": ['monitor', 'display', 'inch', 'ips', 'va panel'],
        }
        for comp_type, patterns in type_patterns.items():
            if any(pattern in name_lower for pattern in patterns):
                return comp_type
        return "other"

    def apply_gst(self, price: float, component_type: str, is_inclusive: bool, currency: str) -> float:
        # GST normalization is only applied to the existing India/INR retailer rules.
        if currency != "INR" or is_inclusive:
            return price
        gst_rate = self.GST_RATES.get(component_type, 18)
        return price * (1 + gst_rate / 100)

    def _normalize_tokens(self, text: str) -> List[str]:
        text = text.lower()
        text = text.replace("®", "").replace("™", "")
        tokens = re.findall(r'[a-z0-9]+', text)
        return [t for t in tokens if t not in self.GENERIC_TERMS]

    def _match_score(self, component_name: str, result: Dict[str, Any]) -> float:
        target = self._normalize_tokens(component_name)
        if not target:
            return 0.0

        title = str(result.get("title", ""))
        content = str(result.get("content", ""))
        url = str(result.get("url", ""))
        title_tokens = set(self._normalize_tokens(title))
        full_tokens = set(self._normalize_tokens(f"{title} {content} {url}"))

        overlap = sum(1 for token in target if token in title_tokens)
        full_overlap = sum(1 for token in target if token in full_tokens)

        title_score = overlap / len(target)
        full_score = full_overlap / len(target)

        # Model-number tokens are strong evidence for exact SKU matching.
        model_tokens = [t for t in target if any(ch.isdigit() for ch in t)]
        model_match = sum(1 for token in model_tokens if token in full_tokens)
        model_score = model_match / len(model_tokens) if model_tokens else 1.0

        return min(1.0, 0.65 * title_score + 0.25 * full_score + 0.10 * model_score)

    def _extract_price_candidates(self, text: str) -> List[Tuple[float, str, int]]:
        candidates = []
        for pattern, currency in self.PRICE_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                price = self.clean_price(match.group(1))
                if price is not None:
                    candidates.append((price, currency, match.start()))
        return candidates

    def _candidate_score(self, text: str, position: int) -> float:
        start = max(0, position - 100)
        end = min(len(text), position + 100)
        context = text[start:end].lower()
        score = 0.0
        for term in ("price", "sale", "deal", "buy", "selling", "now", "offer"):
            if term in context:
                score += 0.12
        for term in ("mrp", "msrp", "emi", "per month"):
            if term in context:
                score -= 0.20
        return score

    def parse_search_results(
        self,
        search_results: Any,
        component_name: str,
        currency: str = "INR",
    ) -> List[PriceEntry]:
        if isinstance(search_results, dict):
            results = search_results.get("results", []) or []
        elif isinstance(search_results, list):
            results = search_results
        else:
            return []

        prices: List[PriceEntry] = []
        self.seen_prices = set()
        desired_currency = (currency or "INR").upper()

        for result in results:
            if not isinstance(result, dict):
                continue

            match_confidence = self._match_score(component_name, result)
            # Exact product verification needs a meaningful product-name match.
            if match_confidence < 0.60:
                continue

            title = str(result.get("title", ""))
            content = str(result.get("content", ""))
            combined = f"{title}\n{content}"
            retailer = self.detect_retailer(f"{title}\n{content}\n{result.get('url', '')}")
            candidates = self._extract_price_candidates(combined)
            if not candidates:
                continue

            ranked = []
            for price, found_currency, position in candidates:
                if found_currency != desired_currency:
                    continue
                context_score = self._candidate_score(combined, position)
                # Prefer a price that is clearly tied to the product and a current sale/list price.
                score = match_confidence + context_score
                ranked.append((score, price, found_currency))

            if not ranked:
                continue

            ranked.sort(key=lambda item: item[0], reverse=True)
            _, raw_price, found_currency = ranked[0]

            is_gst_inclusive = True
            if retailer in self.RETAILER_PATTERNS and found_currency == "INR":
                is_gst_inclusive = self.RETAILER_PATTERNS[retailer]["gst_inclusive"]

            final_price = self.apply_gst(
                raw_price,
                self.detect_component_type(component_name),
                is_gst_inclusive,
                found_currency,
            )
            final_price = round(final_price, 2)

            if self._is_unrealistic_price(final_price, component_name, found_currency):
                continue

            in_stock = not any(
                x in combined.lower()
                for x in ["out of stock", "sold out", "unavailable", "not available"]
            )

            price_key = f"{component_name.lower()}::{retailer or 'unknown'}::{found_currency}::{final_price}"
            if price_key in self.seen_prices:
                continue
            self.seen_prices.add(price_key)

            prices.append(PriceEntry(
                component=component_name,
                retailer=retailer or "unknown",
                price=final_price,
                currency=found_currency,
                gst_inclusive=True,
                in_stock=in_stock,
                url=str(result.get("url", "")),
                match_confidence=round(match_confidence, 3),
            ))

        prices.sort(key=lambda x: (not x.in_stock, -x.match_confidence, x.price))
        return prices

    def _is_unrealistic_price(self, price: float, component_name: str, currency: str) -> bool:
        # Keep the existing broad INR sanity checks; don't apply INR thresholds globally.
        if currency != "INR":
            return False
        name = component_name.lower()
        if 'rtx' in name or 'radeon' in name or 'gpu' in name:
            return price < 5000 or price > 300000
        if 'ryzen' in name or 'core' in name or 'intel' in name:
            return price < 1000 or price > 200000
        if 'motherboard' in name or any(x in name for x in ['b650', 'z790', 'b760', 'b550']):
            return price < 2000 or price > 100000
        if 'ram' in name or 'ddr' in name:
            return price < 500 or price > 50000
        return False

    def get_best_price(
        self,
        component: str,
        search_results: Any,
        currency: str = "INR",
    ) -> Dict:
        entries = self.parse_search_results(search_results, component, currency)

        if not entries:
            return {
                "component": component,
                "error": "No exact product prices found",
                "prices": [],
                "best_price": None,
                "best_retailer": None,
                "avg_price": None,
                "currency": currency or "INR",
                "match_confidence": 0,
            }

        in_stock_entries = [e for e in entries if e.in_stock]
        candidates = in_stock_entries or entries

        # Highest confidence first; price is only a tiebreaker.
        best = max(candidates, key=lambda e: (e.match_confidence, -e.price))
        avg_price = sum(e.price for e in candidates) / len(candidates)

        return {
            "component": component,
            "prices": [
                {
                    "retailer": e.retailer,
                    "price": e.price,
                    "currency": e.currency,
                    "in_stock": e.in_stock,
                    "url": e.url,
                    "match_confidence": e.match_confidence,
                }
                for e in entries[:10]
            ],
            "best_price": best.price,
            "best_retailer": best.retailer,
            "avg_price": round(avg_price, 2),
            "price_range": {
                "min": min(e.price for e in candidates),
                "max": max(e.price for e in candidates),
            },
            "currency": best.currency,
            "gst_verified": best.gst_inclusive,
            "match_confidence": best.match_confidence,
            "timestamp": datetime.now().isoformat(),
        }
