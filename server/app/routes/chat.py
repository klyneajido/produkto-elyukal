#routes/chat.py
from fastapi import APIRouter
from pydantic import BaseModel
import requests
import json
import re
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
import time
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load JSON data
DATA_PATH = "app/data/database_data_processed.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    all_data = json.load(f)

# Pydantic model for message
class Message(BaseModel):
    message: str

# Initialize router
router = APIRouter()

# Check Ollama server
def check_ollama_server():
    """Check if Ollama server is running"""
    for _ in range(5):
        try:
            response = requests.get("http://localhost:11434", timeout=2)
            if response.status_code == 200:
                return True
        except requests.RequestException:
            time.sleep(1)
    return False

# Pre-process data
def prepare_data():
    """Pre-process data for fast lookups"""
    data_index = {
        'products_by_location': {},
        'municipality_info': {},
        'store_info': all_data.get('store_info', {}),
        'stores_by_name': {}
    }
    
    # Create a mapping of town ID to town name
    town_id_to_name = {
        str(m['id']): m['name'].lower()
        for m in all_data.get('municipalities', [])
    }
    
    # Index products by location
    for product in all_data.get('products', []):
        town_id = product.get('town')
        town_name = town_id_to_name.get(town_id, town_id)
        if not town_name:
            logger.warning(f"No town name found for town ID {town_id} in product {product['name']}")
            continue
        town_name = town_name.lower()
        if town_name not in data_index['products_by_location']:
            data_index['products_by_location'][town_name] = []
        data_index['products_by_location'][town_name].append(product)
        logger.debug(f"Indexed product {product['name']} for {town_name}")
    
    # Index municipalities
    for municipality in all_data.get('municipalities', []):
        name = municipality.get('name', '').lower()
        data_index['municipality_info'][name] = municipality
        logger.debug(f"Indexed municipality {name}")
    
    # Index stores by name
    for store in all_data.get('stores', []):
        data_index['stores_by_name'][store['name'].lower()] = store
        logger.debug(f"Indexed store {store['name']}")
    
    # Log products for San Juan
    logger.debug(f"Products for san juan: {data_index['products_by_location'].get('san juan', [])}")
    
    return data_index

DATA_INDEX = prepare_data()

def create_minimal_prompt(intent, message, locations=None):
    """Creates a precise prompt for ElyuBot based on intent and locations"""
    base_prompt = (
        "You are ElyuBot, a helpful assistant for an app about La Union. "
        "Your name is ElyuBot, spelled E-L-Y-U-B-O-T. "
        "Answer strictly based on the provided JSON data about products, stores, and municipalities. "
        "Do not invent or add information not in the JSON. "
        "If no relevant data is found, say exactly: 'No information available in the data.' "
        "Keep responses concise, factual, and limited to the provided details."
    )
    
    if intent == "greeting":
        return base_prompt + " Respond with a short, friendly greeting starting with 'Hi, I'm ElyuBot!'"
    
    elif intent == "product_inquiry":
        prompt = base_prompt + " List products from the JSON data."
        if locations:
            products = []
            for location in locations:
                location_products = DATA_INDEX['products_by_location'].get(location.lower(), [])
                products.extend(location_products[:5])
            if products:
                product_list = [
                    f"{p.get('name')} (₱{p.get('price_range')}) at {p.get('store_name')}"
                    for p in products[:10]
                ]
                prompt += (
                    f" For {', '.join(locations)}, the available products are: "
                    f"{', '.join(product_list)}. "
                    "List these products exactly as provided without adding or changing details."
                )
            else:
                prompt += " No information available in the data."
        else:
            all_products = all_data.get('products', [])[:10]
            if all_products:
                product_list = [
                    f"{p.get('name')} (₱{p.get('price_range')}) at {p.get('store_name')}"
                    for p in all_products
                ]
                prompt += (
                    f" Available products: {', '.join(product_list)}. "
                    "List these products exactly as provided without adding or changing details."
                )
            else:
                prompt += " No information available in the data."
    
    elif intent == "store_info":
        prompt = base_prompt + " Provide store information from the JSON data."
        if "store" in message.lower() or any(s['name'].lower() in message.lower() for s in all_data.get('stores', [])):
            store_name = None
            for store in all_data.get('stores', []):
                if store['name'].lower() in message.lower():
                    store_name = store['name']
                    prompt += (
                        f" Details for {store_name}: Located in town ID {store.get('town')}, "
                        f"open {store.get('operating_hours', 'N/A')}, "
                        f"contact {store.get('phone', 'N/A')}. "
                        "Provide only these details without adding extra information."
                    )
                    break
            if not store_name:
                prompt += " No information available in the data."
        else:
            prompt += " Please specify a store name."
    
    elif intent == "location_info":
        prompt = base_prompt + " Provide information about La Union municipalities from the JSON data."
        if locations:
            for location in locations:
                muni_info = DATA_INDEX['municipality_info'].get(location.lower())
                if muni_info:
                    prompt += (
                        f" {location}: {muni_info.get('description', 'A municipality in La Union')}. "
                        "Use this description exactly without modifications."
                    )
                else:
                    prompt += f" No information available for {location}."
        else:
            prompt += " Please specify a municipality."
    
    else:  # general or combined
        prompt = base_prompt + (
            " Answer based on the JSON data about products, stores, or municipalities. "
            "If the query involves multiple categories, address each clearly using only the provided data."
        )
    
    prompt += f"\n\nUser: {message}\nElyuBot: "
    return prompt

def extract_location(message):
    """Extract location mentions from the message"""
    message = message.lower()
    locations = set()
    municipalities = [
        "agoo", "aringay", "bacnotan", "bagulin", "balaoan", "bangar", "bauang",
        "burgos", "caba", "luna", "naguilian", "pugo", "rosario", "san fernando",
        "san gabriel", "san juan", "santol", "sudipen", "tubao", "santo tomas"
    ]
    
    # Check multi-word municipalities first
    multi_word = ["san fernando", "san gabriel", "san juan", "santo tomas"]
    for municipality in multi_word:
        if municipality in message:
            locations.add(municipality)
    
    # Check single-word municipalities
    message_words = set(re.findall(r'\b\w+\b', message))
    for municipality in municipalities:
        if municipality in message_words and municipality not in locations:
            locations.add(municipality)
    
    locations = list(locations)
    logger.debug(f"Extracted locations: {locations}")
    return locations

def detect_intent(message):
    """Detect intent for ElyuBot queries"""
    message = message.lower()
    
    if any(word in message for word in ["hi", "hello", "hey", "morning", "afternoon", "greetings"]):
        return "greeting"
    
    if any(word in message for word in ["store", "shop", "market", "farm", "contact", "hours", "address"]):
        return "store_info"
    
    if any(word in message for word in ["product", "item", "sell", "price", "cost", "buy"]):
        return "product_inquiry"
    
    if any(word in message for word in ["municipality", "town", "city", "place", "visit", "tourist", "attraction"]):
        return "location_info"
    
    return "general"

@router.post("/chat")
def chat(message: Message):
    intent = detect_intent(message.message)
    locations = extract_location(message.message)
    prompt = create_minimal_prompt(intent, message.message, locations)
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_fixed(2),
        retry=retry_if_exception_type(requests.RequestException)
    )
    def make_request():
        response = requests.post(
            "http://localhost:11434/api/generate", 
            json={
                "model": "tinyllama",
                "prompt": prompt,
                "stream": False,
                "temperature": 0.1,
                "max_tokens": 80,
                "top_p": 0.8,
                "frequency_penalty": 0.7,
                "presence_penalty": 0.7
            },
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    
    try:
        response = make_request()
        response_text = response.get('response', '')
        
        # Validate product_inquiry responses
        if intent == "product_inquiry" and locations:
            expected_products = []
            for location in locations:
                expected_products.extend(DATA_INDEX['products_by_location'].get(location.lower(), [])[:5])
            expected_product_names = {p['name'] for p in expected_products}
            
            # Check if response claims no products but data exists
            if "No products found" in response_text and expected_products:
                logger.warning(f"Model reported no products for {locations}, but data exists: {expected_product_names}")
                product_list = [
                    f"{p.get('name')} (₱{p.get('price_range')}) at {p.get('store_name')}"
                    for p in expected_products[:10]
                ]
                response_text = f"ElyuBot: Products for {', '.join(locations)}: {', '.join(product_list)}."
        
        # Fix typo if present
        response_text = response_text.replace("EliyaBot", "ElyuBot")
        
        return {
            "model": response.get("model", "tinyllama"),
            "created_at": response.get("created_at", ""),
            "response": response_text
        }
    except requests.RequestException as e:
        logger.error(f"Request failed: {str(e)}")
        return {"error": f"Failed to connect to the model after retries: {str(e)}. Please try again."}