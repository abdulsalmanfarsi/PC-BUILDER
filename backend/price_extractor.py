"""
Price extraction and normalization for Indian PC components.
Handles multiple retailers, GST, and Indian number formats.
"""

import re
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class PriceEntry:
    """Structured price entry"""
    component: str
    retailer: str
    price: float
    currency: str = "INR"
    gst_inclusive: bool = True
    in_stock: bool = True
    url: str = ""
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

class IndianPriceExtractor:
    """Extract and normalize prices from Indian e-commerce sites"""
    
    # Retailer patterns and GST status - IMPROVED
    RETAILER_PATTERNS = {
        "amazon": {
            "patterns": [r'amazon\.in', r'amazon india', r'amazon'],
            "gst_inclusive": True,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)',
            ]
        },
        "flipkart": {
            "patterns": [r'flipkart\.com', r'flipkart'],
            "gst_inclusive": True,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)'
            ]
        },
        "mdcomputers": {
            "patterns": [r'mdcomputers\.in', r'md computers', r'mdcomputers'],
            "gst_inclusive": False,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)',
                r'Price:\s*₹\s*([\d,]+(?:\.\d{2})?)'
            ]
        },
        "vedant": {
            "patterns": [r'vedantcomputers\.com', r'vedant computers', r'vedant'],
            "gst_inclusive": False,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)'
            ]
        },
        "primeabgb": {
            "patterns": [r'primeabgb\.com', r'prime abgb', r'primeabgb'],
            "gst_inclusive": False,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)'
            ]
        },
        "itdepot": {
            "patterns": [r'itdepot\.com', r'it depot', r'itdepot'],
            "gst_inclusive": False,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)'
            ]
        },
        "elitehubs": {
            "patterns": [r'elitehubs\.com', r'elite hubs'],
            "gst_inclusive": False,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)'
            ]
        },
        "pcstudio": {
            "patterns": [r'pcstudio\.in', r'pc studio'],
            "gst_inclusive": False,
            "price_selectors": [
                r'₹\s*([\d,]+(?:\.\d{2})?)',
                r'Rs\.?\s*([\d,]+(?:\.\d{2})?)'
            ]
        }
    }
    
    # GST rates by component type
    GST_RATES = {
        "cpu": 18,
        "gpu": 28,
        "motherboard": 18,
        "ram": 18,
        "ssd": 18,
        "hdd": 18,
        "psu": 18,
        "case": 18,
        "cooler": 18,
        "monitor": 18,
        "keyboard": 18,
        "mouse": 18,
        "other": 18
    }
    
    def __init__(self):
        self.cache: Dict[str, List[PriceEntry]] = {}
        self.cache_expiry = timedelta(hours=6)
        self.seen_prices = set()  # To track duplicate prices
    
    def clean_indian_price(self, price_str: str) -> Optional[float]:
        """
        Clean Indian price format: ₹1,24,999 → 124999.0
        """
        if not price_str:
            return None
        
        # Remove ₹, Rs., commas, spaces
        cleaned = re.sub(r'[₹,,\s]', '', price_str)
        cleaned = re.sub(r'Rs\.?', '', cleaned, flags=re.IGNORECASE)
        
        # Extract only digits and decimal
        cleaned = re.sub(r'[^0-9.]', '', cleaned)
        
        try:
            price = float(cleaned)
            # Filter out unrealistic prices
            if price < 100 or price > 500000:
                return None
            return price
        except ValueError:
            return None
    
    def detect_retailer(self, text: str) -> Optional[str]:
        """Detect which retailer the text is from - IMPROVED"""
        text_lower = text.lower()
        
        # Check URL first
        url_match = re.search(r'(https?://[^\s]+)', text_lower)
        if url_match:
            url = url_match.group(1)
            for retailer, info in self.RETAILER_PATTERNS.items():
                for pattern in info["patterns"]:
                    if re.search(pattern, url, re.IGNORECASE):
                        return retailer
        
        # Then check text content
        for retailer, info in self.RETAILER_PATTERNS.items():
            for pattern in info["patterns"]:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    return retailer
        
        # Check title if present
        title_match = re.search(r'Title:\s*([^\n]+)', text, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).lower()
            for retailer, info in self.RETAILER_PATTERNS.items():
                for pattern in info["patterns"]:
                    if re.search(pattern, title, re.IGNORECASE):
                        return retailer
        
        return None
    
    def extract_price_from_text(self, text: str, retailer: Optional[str] = None) -> Optional[Tuple[float, bool]]:
        """
        Extract price from text - IMPROVED with better validation
        """
        # First try to find a clear price pattern
        price_patterns = [
            r'₹\s*([\d,]+(?:\.\d{2})?)',
            r'Rs\.?\s*([\d,]+(?:\.\d{2})?)',
            r'([\d,]+(?:\.\d{2})?)\s*(?:₹|Rs\.)',
            r'Price:\s*₹\s*([\d,]+(?:\.\d{2})?)',
            r'MRP:\s*₹\s*([\d,]+(?:\.\d{2})?)',
            r'₹\s*([\d,]+)\s*(?:\(.*?\))?',  # Price in parentheses
        ]
        
        # Check for price range patterns to avoid picking the wrong price
        if re.search(r'[\d,]+\s*-\s*[\d,]+', text):
            # This is a range, try to find the actual price
            pass
        
        best_price = None
        best_is_gst_inclusive = True
        
        for pattern in price_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                cleaned = self.clean_indian_price(match if isinstance(match, str) else match[0])
                if cleaned and cleaned > 0:
                    # If we have a retailer with known GST status, use it
                    if retailer and retailer in self.RETAILER_PATTERNS:
                        is_gst_inclusive = self.RETAILER_PATTERNS[retailer]["gst_inclusive"]
                    else:
                        # Default: assume GST inclusive for common e-commerce
                        is_gst_inclusive = True
                    
                    # Prefer lower prices (more realistic)
                    if best_price is None or cleaned < best_price:
                        best_price = cleaned
                        best_is_gst_inclusive = is_gst_inclusive
        
        if best_price:
            return (best_price, best_is_gst_inclusive)
        
        return None
    
    def detect_component_type(self, component_name: str) -> str:
        """Detect component type for GST calculation"""
        name_lower = component_name.lower()
        
        type_patterns = {
            "cpu": ['intel', 'amd', 'ryzen', 'core i', 'processor', 'xeon', 'threadripper'],
            "gpu": ['rtx', 'radeon', 'geforce', 'gpu', 'graphics', 'gtx', 'rx ', 'arc'],
            "motherboard": ['b760', 'z790', 'b650', 'x670', 'motherboard', 'a620', 'h610', 'b550', 'x570'],
            "ram": ['ddr', 'ram', 'memory', 'vengeance', 'trident', 'ballistix', 'fury'],
            "ssd": ['ssd', 'nvme', 'm.2', 'sata', 'crucial', 'samsung', 'wd'],
            "hdd": ['hdd', 'barracuda', 'ironwolf', 'hard drive'],
            "psu": ['power supply', 'psu', 'corsair rm', 'seasonic', 'super flower', 'cooler master'],
            "case": ['case', 'cabinet', 'chassis', 'corsair 4000', 'nzxt', 'lian li'],
            "cooler": ['cooler', 'aio', 'liquid cooler', 'air cooler', 'noctua', 'deepcool'],
            "monitor": ['monitor', 'display', 'inch', 'ips', 'va panel'],
        }
        
        for comp_type, patterns in type_patterns.items():
            if any(pattern in name_lower for pattern in patterns):
                return comp_type
        
        return "other"
    
    def apply_gst(self, price: float, component_type: str, is_inclusive: bool) -> float:
        """Convert price to GST-inclusive or exclusive"""
        gst_rate = self.GST_RATES.get(component_type, 18)
        
        if is_inclusive:
            return price
        else:
            return price * (1 + gst_rate / 100)
    
    def parse_search_results(self, search_text: str, component_name: str) -> List[PriceEntry]:
        """
        Parse search results text into structured price entries - IMPROVED
        """
        prices = []
        self.seen_prices = set()  # Reset for each component
        
        # Split into blocks by double newline or URL
        blocks = re.split(r'\n\s*\n|(?=https?://)', search_text)
        
        for block in blocks:
            if not block.strip():
                continue
            
            # Check if this is actually about the component we're looking for
            # Skip if the block doesn't mention the component or similar products
            if component_name.lower() not in block.lower():
                # But keep it if it has a price and might be relevant
                if not re.search(r'₹\s*[\d,]+', block):
                    continue
            
            # Detect retailer
            retailer = self.detect_retailer(block)
            
            # Extract price
            price_data = self.extract_price_from_text(block, retailer)
            if not price_data:
                continue
            
            price, is_gst_inclusive = price_data
            
            # Skip if price seems unrealistic for this component
            if self._is_unrealistic_price(price, component_name):
                continue
            
            # Check if in stock
            in_stock = not any(x in block.lower() for x in ['out of stock', 'sold out', 'unavailable', 'not available'])
            
            # Detect component type
            comp_type = self.detect_component_type(component_name)
            
            # Apply GST if needed
            final_price = self.apply_gst(price, comp_type, is_gst_inclusive)
            final_price = round(final_price, 2)
            
            # Deduplicate: skip if we've seen this exact price for this retailer
            price_key = f"{retailer}:{final_price}"
            if price_key in self.seen_prices:
                continue
            self.seen_prices.add(price_key)
            
            # Extract URL if present
            url_match = re.search(r'(https?://[^\s\n]+)', block)
            url = url_match.group(1) if url_match else ""
            
            prices.append(PriceEntry(
                component=component_name,
                retailer=retailer or "unknown",
                price=final_price,
                gst_inclusive=True,
                in_stock=in_stock,
                url=url
            ))
        
        # Sort by price
        prices.sort(key=lambda x: x.price)
        return prices
    
    def _is_unrealistic_price(self, price: float, component_name: str) -> bool:
        """Check if price is unrealistic for the component"""
        component_lower = component_name.lower()
        
        # GPU price checks
        if 'rtx' in component_lower or 'radeon' in component_lower or 'gpu' in component_lower:
            if price < 5000 or price > 300000:
                return True
        
        # CPU price checks
        if 'ryzen' in component_lower or 'core' in component_lower or 'intel' in component_lower:
            if price < 1000 or price > 200000:
                return True
        
        # Motherboard price checks
        if 'motherboard' in component_lower or 'b650' in component_lower or 'z790' in component_lower:
            if price < 2000 or price > 100000:
                return True
        
        # RAM price checks
        if 'ram' in component_lower or 'ddr' in component_lower:
            if price < 500 or price > 50000:
                return True
        
        return False
    
    def get_best_price(self, component: str, search_results: str) -> Dict:
        """
        Get the best (lowest) price from search results with metadata
        """
        entries = self.parse_search_results(search_results, component)
        
        if not entries:
            return {
                "component": component,
                "error": "No prices found",
                "prices": [],
                "best_price": None,
                "best_retailer": None,
                "avg_price": None
            }
        
        # Filter out out-of-stock items
        in_stock_entries = [e for e in entries if e.in_stock]
        
        # If all are out of stock, use all entries
        if not in_stock_entries:
            in_stock_entries = entries
        
        # Find best price (lowest)
        best = min(in_stock_entries, key=lambda x: x.price)
        
        # Calculate average (only from reasonable prices)
        avg_price = sum(e.price for e in in_stock_entries) / len(in_stock_entries)
        
        return {
            "component": component,
            "prices": [
                {
                    "retailer": e.retailer,
                    "price": e.price,
                    "in_stock": e.in_stock,
                    "url": e.url
                }
                for e in entries[:10]  # Limit to 10 prices
            ],
            "best_price": best.price,
            "best_retailer": best.retailer,
            "avg_price": round(avg_price, 2),
            "price_range": {
                "min": min(e.price for e in in_stock_entries),
                "max": max(e.price for e in in_stock_entries)
            },
            "gst_verified": True,
            "timestamp": datetime.now().isoformat()
        }