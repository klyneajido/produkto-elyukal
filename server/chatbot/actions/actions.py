from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import json
import os
import re
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

file_path = os.path.join(os.path.dirname(__file__), "database_data_processed.json")
logger.debug(f"Current working directory: {os.getcwd()}")
logger.debug(f"Script directory: {os.path.dirname(__file__)}")
logger.debug(f"Attempting to open file at: {file_path}")
logger.debug(f"File exists: {os.path.exists(file_path)}")

with open(file_path, "r", encoding="utf-8") as file:
    data = json.load(file)

def clean_town_name(town: str) -> str:
    if not town:
        return town
    town = re.sub(r'\s+', ' ', town.strip().lower())
    town_synonyms = {
        "ag": "agoo",
        "city of san fernando": "san fernando",
        "fernando": "san fernando",
        "sfc": "san fernando",
        "nags": "naguilian",
        "santo": "santo tomas",
        "tomas": "santo tomas",
        "st": "santo tomas",
        "sud": "sudipen",
        "ros": "rosario",
        "bau": "bauang",
        "aring": "aringay",
        "bac": "bacnotan",
        "bal": "balaoan",
        "bang": "bangar",
        "cab": "caba",
        "lun": "luna",
        "pug": "pugo",
        "sanj": "san juan",
        "sj": "san juan",
        "sant": "santol",
        "tub": "tubao"
    }
    town = town_synonyms.get(town, town)
    if town == "la union":
        return "La Union"
    if town.startswith("san "):
        town = "San " + town[4:].capitalize()
    else:
        town = town.capitalize()
    return town

class ActionFetchProductsByTown(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_town"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching products for town: {town}")
        if not town:
            dispatcher.utter_message(text="Ooh, which La Union town are we exploring today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        if town.lower() == "la union":
            products = data["products"]
        else:
            products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        
        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"Ay, no products found in {town} yet. {nearby_suggestion}")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(text=f"In {town}, you’ve got these cool finds: {product_list}")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductsByCategory(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_category"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        category = tracker.get_slot("product_category")
        if not category:
            dispatcher.utter_message(text="What’s your vibe? Snacks, handicrafts, or maybe some drinks?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        products = [p for p in data["products"] if p["category"].lower() == category.lower()]
        if not products:
            dispatcher.utter_message(text=f"No {category} found. Maybe try snacks or crafts?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(text=f"Woohoo! Here are some {category} in La Union: {product_list}")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchStoreDetails(Action):
    def name(self) -> Text:
        return "action_fetch_store_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        store_name = tracker.get_slot("store_name")
        if not store_name:
            dispatcher.utter_message(text="Which shop’s got your attention? Spill the beans!")
            return [SlotSet("description", None), SlotSet("products", None)]

        store = next((s for s in data["stores"] if s["name"].lower().startswith(store_name.lower())), None)
        if not store:
            dispatcher.utter_message(text=f"No details found for {store_name}. Try another store!")
            return [SlotSet("description", None), SlotSet("products", None)]

        dispatcher.utter_message(text=f"All about {store_name}: {store['description']}")
        return [SlotSet("description", store['description']), SlotSet("products", None)]

class ActionFetchStoreLocation(Action):
    def name(self) -> Text:
        return "action_fetch_store_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        store_name = tracker.get_slot("store_name")
        if not store_name:
            dispatcher.utter_message(text="Which shop’s got your attention? Spill the beans!")
            return [SlotSet("operating_hours", None), SlotSet("phone", None), SlotSet("products", None)]

        store = next((s for s in data["stores"] if s["name"].lower().startswith(store_name.lower())), None)
        if not store:
            dispatcher.utter_message(text=f"No location found for {store_name}. Try another store!")
            return [SlotSet("operating_hours", None), SlotSet("phone", None), SlotSet("products", None)]

        dispatcher.utter_message(text=f"You’ll find {store_name} in {store['town']}! Open {store['operating_hours'] or 'Not available'}, call them at {store['phone'] or 'Not available'}.")
        return [
            SlotSet("operating_hours", store["operating_hours"] or "Not available"),
            SlotSet("phone", store["phone"] or "Not available"),
            SlotSet("products", None)
        ]

class ActionFetchProductByName(Action):
    def name(self) -> Text:
        return "action_fetch_product_by_name"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name")
        logger.debug(f"Fetching product by name: {product_name}")
        if not product_name:
            dispatcher.utter_message(text="What cool product are you hunting for today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        synonym_map = {
            "inabel": "inabel towel", "towel": "inabel towel", "handloom": "inabel towel", "weaving": "inabel towel", "abel": "inabel towel",
            "daing": "dried fish", "dried fish": "dried fish", "tuyo": "dried fish",
            "baskets": "Labtang Basket", "basket": "Labtang Basket", "basket weaving": "Labtang Basket", "labtang": "Labtang Basket",
            "colored brooms": "colored soft broom", "colored broom": "colored soft broom", "broom": "colored soft broom", 
            "soft broom": "colored soft broom", "walis tambo": "colored soft broom", "buyboy": "colored soft broom",
            "honey": "honey", "pulot": "honey",
            "basi": "basi", "sugarcane wine": "basi", "alak na tubo": "basi", "innumin": "basi",
            "grapes": "grapes", "ubas": "grapes", "grape wine": "grapes", "alak na ubas": "grapes",
            "mushrooms": "mushrooms", "kabute": "mushrooms",
            "sea urchin": "sea urchins", "sea urchins": "sea urchins", "maritangtang": "sea urchins", "tayom": "sea urchins",
            "pebbles": "pebble crafts", "pebble crafts": "pebble crafts", "bato": "pebble crafts",
            "pottery": "damili", "clay pot": "damili", "palayok": "damili", "damili": "damili",
            "tea": "lemongrass and ginger tea", "lemongrass tea": "lemongrass and ginger tea", "ginger tea": "lemongrass and ginger tea", 
            "salabat": "lemongrass and ginger tea",
            "chichacorn": "chichacorn", "cornick": "chichacorn", "mais": "chichacorn",
            "ube wine": "ube wine", "ube": "ube wine", "purple yam": "ube wine", "halayang ube": "ube wine",
            "bamboo": "bamboo crafts", "bamboo crafts": "bamboo crafts", "kawayan": "bamboo crafts",
            "furniture": "wood furniture", "wood": "wood furniture", "kagamitan sa bahay": "wood furniture", "upan": "wood furniture",
            "bangus": "milkfish", "milkfish": "milkfish", "isda": "milkfish",
            "walis": "colored soft broom"
        }
        product_name = synonym_map.get(product_name.lower(), product_name.lower())
        products = [p for p in data["products"] if product_name in p["name"].lower() or product_name in p["description"].lower()]
        if not products:
            dispatcher.utter_message(text=f"Oops, couldn’t find {product_name} in La Union. Wanna try another product or maybe some snacks?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        towns = sorted(set(clean_town_name(p["town"]) for p in products))
        product_list = f"{product_name} (available in {', '.join(towns)})"
        dispatcher.utter_message(text=f"Check out {product_list}!")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductAvailability(Action):
    def name(self) -> Text:
        return "action_fetch_product_availability"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name")
        logger.debug(f"Checking availability for: {product_name}")
        if not product_name:
            dispatcher.utter_message(text="What cool product are you hunting for today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        synonym_map = {
            "inabel": "inabel towel", "towel": "inabel towel", "handloom": "inabel towel", "weaving": "inabel towel", "abel": "inabel towel",
            "daing": "dried fish", "dried fish": "dried fish", "tuyo": "dried fish",
            "baskets": "Labtang Basket", "basket": "Labtang Basket", "basket weaving": "Labtang Basket", "labtang": "Labtang Basket",
            "colored brooms": "colored soft broom", "colored broom": "colored soft broom", "broom": "colored soft broom", 
            "soft broom": "colored soft broom", "walis tambo": "colored soft broom", "buyboy": "colored soft broom",
            "honey": "honey", "pulot": "honey",
            "basi": "basi", "sugarcane wine": "basi", "alak na tubo": "basi", "innumin": "basi",
            "grapes": "grapes", "ubas": "grapes", "grape wine": "grapes", "alak na ubas": "grapes",
            "mushrooms": "mushrooms", "kabute": "mushrooms",
            "sea urchin": "sea urchins", "sea urchins": "sea urchins", "maritangtang": "sea urchins", "tayom": "sea urchins",
            "pebbles": "pebble crafts", "pebble crafts": "pebble crafts", "bato": "pebble crafts",
            "pottery": "damili", "clay pot": "damili", "palayok": "damili", "damili": "damili",
            "tea": "lemongrass and ginger tea", "lemongrass tea": "lemongrass and ginger tea", "ginger tea": "lemongrass and ginger tea", 
            "salabat": "lemongrass and ginger tea",
            "chichacorn": "chichacorn", "cornick": "chichacorn", "mais": "chichacorn",
            "ube wine": "ube wine", "ube": "ube wine", "purple yam": "ube wine", "halayang ube": "ube wine",
            "bamboo": "bamboo crafts", "bamboo crafts": "bamboo crafts", "kawayan": "bamboo crafts",
            "furniture": "wood furniture", "wood": "wood furniture", "kagamitan sa bahay": "wood furniture", "upan": "wood furniture",
            "bangus": "milkfish", "milkfish": "milkfish", "isda": "milkfish",
            "walis": "colored soft broom"
        }
        product_name = synonym_map.get(product_name.lower(), product_name.lower())
        products = [p for p in data["products"] if product_name in p["name"].lower() or product_name in p["description"].lower()]
        if not products:
            dispatcher.utter_message(text=f"Sorry, no {product_name} around. Wanna explore some local snacks or crafts instead?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        dispatcher.utter_message(text=f"Yay, we’ve got {product_name} in La Union! Wanna know where to grab it?")
        return [SlotSet("products", product_name), SlotSet("store_name", None)]

class ActionFetchProductLocation(Action):
    def name(self) -> Text:
        return "action_fetch_product_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name") or tracker.get_slot("product_type")
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching location for product: {product_name}, town: {town}")

        if not product_name:
            dispatcher.utter_message(text="What cool product are you hunting for today?")
            return [SlotSet("store_name", None), SlotSet("products", None)]

        synonym_map = {
            "inabel": "inabel towel", "towel": "inabel towel", "handloom": "inabel towel", "weaving": "inabel towel", "abel": "inabel towel",
            "daing": "dried fish", "dried fish": "dried fish", "tuyo": "dried fish",
            "baskets": "Labtang Basket", "basket": "Labtang Basket", "basket weaving": "Labtang Basket", "labtang": "Labtang Basket",
            "colored brooms": "colored soft broom", "colored broom": "colored soft broom", "broom": "colored soft broom", 
            "soft broom": "colored soft broom", "walis tambo": "colored soft broom", "buyboy": "colored soft broom",
            "honey": "honey", "pulot": "honey",
            "basi": "basi", "sugarcane wine": "basi", "alak na tubo": "basi", "innumin": "basi",
            "grapes": "grapes", "ubas": "grapes", "grape wine": "grapes", "alak na ubas": "grapes",
            "mushrooms": "mushrooms", "kabute": "mushrooms",
            "sea urchin": "sea urchins", "sea urchins": "sea urchins", "maritangtang": "sea urchins", "tayom": "sea urchins",
            "pebbles": "pebble crafts", "pebble crafts": "pebble crafts", "bato": "pebble crafts",
            "pottery": "damili", "clay pot": "damili", "palayok": "damili", "damili": "damili",
            "tea": "lemongrass and ginger tea", "lemongrass tea": "lemongrass and ginger tea", "ginger tea": "lemongrass and ginger tea", 
            "salabat": "lemongrass and ginger tea",
            "chichacorn": "chichacorn", "cornick": "chichacorn", "mais": "chichacorn",
            "ube wine": "ube wine", "ube": "ube wine", "purple yam": "ube wine", "halayang ube": "ube wine",
            "bamboo": "bamboo crafts", "bamboo crafts": "bamboo crafts", "kawayan": "bamboo crafts",
            "furniture": "wood furniture", "wood": "wood furniture", "kagamitan sa bahay": "wood furniture", "upan": "wood furniture",
            "bangus": "milkfish", "milkfish": "milkfish", "isda": "milkfish",
            "walis": "colored soft broom"
        }
        product_name = synonym_map.get(product_name.lower(), product_name.lower())
        products = [p for p in data["products"] if product_name in p["name"].lower() or product_name in p["description"].lower()]
        if not products:
            dispatcher.utter_message(text=f"Oops, couldn’t find {product_name} in La Union. Wanna try another product or maybe some snacks?")
            return [SlotSet("store_name", None), SlotSet("products", None)]

        latest_message = tracker.latest_message.get("text", "").lower()
        if town and town.lower() != "la union" and town.lower() in latest_message:
            products = [p for p in products if clean_town_name(p["town"]).lower() == town.lower()]
            if not products:
                nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
                nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
                dispatcher.utter_message(text=f"No {product_name} found in {town}. {nearby_suggestion}")
                return [SlotSet("store_name", None), SlotSet("products", None)]

        store_ids = set(p["store_id"] for p in products if "store_id" in p)
        stores = [s for s in data["stores"] if s["store_id"] in store_ids]
        if not stores:
            towns = sorted(set(clean_town_name(p["town"]) for p in products))
            dispatcher.utter_message(text=f"You can find {product_name} in {', '.join(towns)}. Try local markets or check with nearby shops!")
            return [SlotSet("store_name", None), SlotSet("products", product_name)]

        store_names = ", ".join(sorted(set(s["name"] for s in stores)))
        towns = sorted(set(clean_town_name(s["town"]) for s in stores))
        dispatcher.utter_message(text=f"Score! Find {product_name} at {store_names} in {', '.join(towns)}. Need more info?")
        return [SlotSet("store_name", store_names), SlotSet("products", product_name)]

class ActionFetchProductsByLocation(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching products by location for town: {town}")
        if not town:
            dispatcher.utter_message(text="Ooh, which La Union town are we exploring today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        if town.lower() == "la union":
            products = data["products"]
        else:
            products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        
        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"Ay, no products found in {town} yet. {nearby_suggestion}")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(text=f"In {town}, you’ve got these cool finds: {product_list}")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductsByType(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_type"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_type = tracker.get_slot("product_type")
        logger.debug(f"Fetching products by type: {product_type}")
        if not product_type:
            dispatcher.utter_message(text="What’s your vibe? Snacks, handicrafts, or maybe some drinks?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        type_mapping = {
            "spicy": ["spicy", "hot"],
            "sweet": ["sweet", "dessert", "sugary"],
            "snacks": ["chips", "snack", "talong", "okra"],
            "chocolate": ["chocolate", "cocoa"],
            "food": ["food", "bagoong", "fish", "chips"],
            "handicrafts": ["wooden", "bamboo", "woven", "pottery", "handicraft"],
            "souvenirs": ["souvenir", "craft", "inabel", "broom"],
            "pasalubong": ["bagoong", "chips", "wine", "dried fish"],
            "local snacks": ["chips", "talong", "okra"],
            "inabel": ["inabel", "towel"], "towel": ["inabel", "towel"], "handloom": ["inabel", "towel"], 
            "weaving": ["inabel", "towel"], "abel": ["inabel", "towel"],
            "honey": ["honey"], "pulot": ["honey"],
            "daing": ["dried fish"], "dried fish": ["dried fish"], "tuyo": ["dried fish"],
            "bangus": ["milkfish"], "milkfish": ["milkfish"], "isda": ["milkfish"],
            "bamboo": ["bamboo"], "kawayan": ["bamboo"],
            "wood": ["wood", "narra"], "kagamitan sa bahay": ["wood"], "upan": ["wood"],
            "basi": ["basi", "sugarcane wine"], "sugarcane wine": ["basi"], "alak na tubo": ["basi"], "innumin": ["basi"],
            "baskets": ["basket", "Labtang Basket"], "basket": ["Labtang Basket"], "basket weaving": ["Labtang Basket"], 
            "labtang": ["Labtang Basket"],
            "colored brooms": ["colored soft broom"], "colored broom": ["colored soft broom"], "broom": ["colored soft broom"], 
            "soft broom": ["colored soft broom"], "walis tambo": ["colored soft broom"], "buyboy": ["colored soft broom"],
            "grapes": ["grapes"], "ubas": ["grapes"], "grape wine": ["grapes"], "alak na ubas": ["grapes"],
            "mushrooms": ["mushrooms"], "kabute": ["mushrooms"],
            "sea urchin": ["sea urchins"], "sea urchins": ["sea urchins"], "maritangtang": ["sea urchins"], "tayom": ["sea urchins"],
            "pebbles": ["pebble crafts"], "pebble crafts": ["pebble crafts"], "bato": ["pebble crafts"],
            "pottery": ["damili"], "clay pot": ["damili"], "palayok": ["damili"], "damili": ["damili"],
            "tea": ["lemongrass and ginger tea"], "lemongrass tea": ["lemongrass and ginger tea"], 
            "ginger tea": ["lemongrass and ginger tea"], "salabat": ["lemongrass and ginger tea"],
            "chichacorn": ["chichacorn"], "cornick": ["chichacorn"], "mais": ["chichacorn"],
            "ube wine": ["ube wine"], "ube": ["ube wine"], "purple yam": ["ube wine"], "halayang ube": ["ube wine"],
            "furniture": ["wood furniture"], "wood furniture": ["wood furniture"],
            "walis": ["colored soft broom"]
        }

        keywords = type_mapping.get(product_type.lower(), [product_type.lower()])
        products = [p for p in data["products"] if any(k in p["name"].lower() or k in p["description"].lower() for k in keywords)]

        if not products:
            dispatcher.utter_message(text=f"No {product_type} products found. Try something like 'snacks' or 'handicrafts'!")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(text=f"Check out these {product_type} goodies in La Union: {product_list}")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchStoreByProduct(Action):
    def name(self) -> Text:
        return "action_fetch_store_by_product"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name") or tracker.get_slot("product_category") or tracker.get_slot("product_type")
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching store for product: {product_name}, town: {town}")

        if not product_name:
            dispatcher.utter_message(text="What cool product are you hunting for today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        synonym_map = {
            "inabel": "inabel towel", "towel": "inabel towel", "handloom": "inabel towel", "weaving": "inabel towel", "abel": "inabel towel",
            "daing": "dried fish", "dried fish": "dried fish", "tuyo": "dried fish",
            "baskets": "Labtang Basket", "basket": "Labtang Basket", "basket weaving": "Labtang Basket", "labtang": "Labtang Basket",
            "colored brooms": "colored soft broom", "colored broom": "colored soft broom", "broom": "colored soft broom", 
            "soft broom": "colored soft broom", "walis tambo": "colored soft broom", "buyboy": "colored soft broom",
            "honey": "honey", "pulot": "honey",
            "basi": "basi", "sugarcane wine": "basi", "alak na tubo": "basi", "innumin": "basi",
            "grapes": "grapes", "ubas": "grapes", "grape wine": "grapes", "alak na ubas": "grapes",
            "mushrooms": "mushrooms", "kabute": "mushrooms",
            "sea urchin": "sea urchins", "sea urchins": "sea urchins", "maritangtang": "sea urchins", "tayom": "sea urchins",
            "pebbles": "pebble crafts", "pebble crafts": "pebble crafts", "bato": "pebble crafts",
            "pottery": "damili", "clay pot": "damili", "palayok": "damili", "damili": "damili",
            "tea": "lemongrass and ginger tea", "lemongrass tea": "lemongrass and ginger tea", "ginger tea": "lemongrass and ginger tea", 
            "salabat": "lemongrass and ginger tea",
            "chichacorn": "chichacorn", "cornick": "chichacorn", "mais": "chichacorn",
            "ube wine": "ube wine", "ube": "ube wine", "purple yam": "ube wine", "halayang ube": "ube wine",
            "bamboo": "bamboo crafts", "bamboo crafts": "bamboo crafts", "kawayan": "bamboo crafts",
            "furniture": "wood furniture", "wood": "wood furniture", "kagamitan sa bahay": "wood furniture", "upan": "wood furniture",
            "bangus": "milkfish", "milkfish": "milkfish", "isda": "milkfish",
            "walis": "colored soft broom"
        }
        product_name = synonym_map.get(product_name.lower(), product_name.lower())
        products = [p for p in data["products"] if product_name in p["name"].lower() or product_name in p["description"].lower() or product_name in p["category"].lower()]
        if not products:
            dispatcher.utter_message(text=f"Oops, couldn’t find {product_name} in La Union. Wanna try another product or maybe some snacks?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        latest_message = tracker.latest_message.get("text", "").lower()
        if town and town.lower() != "la union" and town.lower() in latest_message:
            products = [p for p in products if clean_town_name(p["town"]).lower() == town.lower()]
            if not products:
                nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
                nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
                dispatcher.utter_message(text=f"No stores found for {product_name} in {town}. {nearby_suggestion}")
                return [SlotSet("products", None), SlotSet("store_name", None)]

        store_ids = set(p["store_id"] for p in products if "store_id" in p)
        stores = [s for s in data["stores"] if s["store_id"] in store_ids]
        if not stores:
            towns = sorted(set(clean_town_name(p["town"]) for p in products))
            dispatcher.utter_message(text=f"You can find {product_name} in {', '.join(towns)}. Try local markets or check with nearby shops!")
            return [SlotSet("products", product_name), SlotSet("store_name", None)]

        store_names = ", ".join(sorted(set(s["name"] for s in stores)))
        towns = sorted(set(clean_town_name(s["town"]) for s in stores))
        dispatcher.utter_message(text=f"You can grab {product_name} at {store_names} in {', '.join(towns)}. Happy shopping!")
        return [SlotSet("store_name", store_names), SlotSet("products", product_name)]

class ActionFetchRecommendation(Action):
    def name(self) -> Text:
        return "action_fetch_recommendation"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching recommendation for town: {town}")
        if town and town.lower() != "la union":
            products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        else:
            products = data["products"]

        if not products:
            dispatcher.utter_message(text="No products available to recommend. Check back later!")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        popular_products = [p for p in products if any(keyword in p["name"].lower() for keyword in ["basi", "chips", "grapes", "inabel"])]
        if not popular_products:
            popular_products = products[:5]

        product_list = ", ".join(sorted(set(p["name"] for p in popular_products)))
        dispatcher.utter_message(text=f"Oh, you gotta try these La Union faves: {product_list}! Naguilian Basi and Talong Chips are total stars!")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchLocationNearMe(Action):
    def name(self) -> Text:
        return "action_fetch_location_near_me"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching products near town: {town}")
        if not town:
            dispatcher.utter_message(text="Hey, what La Union town are you in? I’ll hook you up with nearby goodies!")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"No products found near {town}. {nearby_suggestion}")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(text=f"In {town}, you’ve got these cool finds: {product_list}")
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductDetails(Action):
    def name(self) -> Text:
        return "action_fetch_product_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name")
        logger.debug(f"Fetching details for product: {product_name}")
        if not product_name:
            dispatcher.utter_message(text="What cool product are you hunting for today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        synonym_map = {
            "inabel": "inabel towel", "towel": "inabel towel", "handloom": "inabel towel", "weaving": "inabel towel", "abel": "inabel towel",
            "daing": "dried fish", "dried fish": "dried fish", "tuyo": "dried fish",
            "baskets": "Labtang Basket", "basket": "Labtang Basket", "basket weaving": "Labtang Basket", "labtang": "Labtang Basket",
            "colored brooms": "colored soft broom", "colored broom": "colored soft broom", "broom": "colored soft broom", 
            "soft broom": "colored soft broom", "walis tambo": "colored soft broom", "buyboy": "colored soft broom",
            "honey": "honey", "pulot": "honey",
            "basi": "basi", "sugarcane wine": "basi", "alak na tubo": "basi", "innumin": "basi",
            "grapes": "grapes", "ubas": "grapes", "grape wine": "grapes", "alak na ubas": "grapes",
            "mushrooms": "mushrooms", "kabute": "mushrooms",
            "sea urchin": "sea urchins", "sea urchins": "sea urchins", "maritangtang": "sea urchins", "tayom": "sea urchins",
            "pebbles": "pebble crafts", "pebble crafts": "pebble crafts", "bato": "pebble crafts",
            "pottery": "damili", "clay pot": "damili", "palayok": "damili", "damili": "damili",
            "tea": "lemongrass and ginger tea", "lemongrass tea": "lemongrass and ginger tea", "ginger tea": "lemongrass and ginger tea", 
            "salabat": "lemongrass and ginger tea",
            "chichacorn": "chichacorn", "cornick": "chichacorn", "mais": "chichacorn",
            "ube wine": "ube wine", "ube": "ube wine", "purple yam": "ube wine", "halayang ube": "ube wine",
            "bamboo": "bamboo crafts", "bamboo crafts": "bamboo crafts", "kawayan": "bamboo crafts",
            "furniture": "wood furniture", "wood": "wood furniture", "kagamitan sa bahay": "wood furniture", "upan": "wood furniture",
            "bangus": "milkfish", "milkfish": "milkfish", "isda": "milkfish",
            "walis": "colored soft broom"
        }
        product_name = synonym_map.get(product_name.lower(), product_name.lower())
        product = next((p for p in data["products"] if product_name in p["name"].lower() or product_name in p["description"].lower()), None)
        if not product:
            dispatcher.utter_message(text=f"Oops, couldn’t find {product_name} in La Union. Wanna try another product or maybe some snacks?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        dispatcher.utter_message(text=f"Here’s the scoop on {product_name}: {product['description'] or 'No description available'}")
        return [SlotSet("products", product["name"]), SlotSet("store_name", None)]

class ActionFetchSignatureProduct(Action):
    def name(self) -> Text:
        return "action_fetch_signature_product"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching signature product for town: {town}")
        if not town:
            dispatcher.utter_message(text="Ooh, which La Union town are we exploring today?")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        synonym_map = {
            "inabel": "inabel towel", "towel": "inabel towel", "handloom": "inabel towel", "weaving": "inabel towel", "abel": "inabel towel",
            "daing": "dried fish", "dried fish": "dried fish", "tuyo": "dried fish",
            "baskets": "Labtang Basket", "basket": "Labtang Basket", "basket weaving": "Labtang Basket", "labtang": "Labtang Basket",
            "colored brooms": "colored soft broom", "colored broom": "colored soft broom", "broom": "colored soft broom", 
            "soft broom": "colored soft broom", "walis tambo": "colored soft broom", "buyboy": "colored soft broom",
            "honey": "honey", "pulot": "honey",
            "basi": "basi", "sugarcane wine": "basi", "alak na tubo": "basi", "innumin": "basi",
            "grapes": "grapes", "ubas": "grapes", "grape wine": "grapes", "alak na ubas": "grapes",
            "mushrooms": "mushrooms", "kabute": "mushrooms",
            "sea urchin": "sea urchins", "sea urchins": "sea urchins", "maritangtang": "sea urchins", "tayom": "sea urchins",
            "pebbles": "pebble crafts", "pebble crafts": "pebble crafts", "bato": "pebble crafts",
            "pottery": "damili", "clay pot": "damili", "palayok": "damili", "damili": "damili",
            "tea": "lemongrass and ginger tea", "lemongrass tea": "lemongrass and ginger tea", "ginger tea": "lemongrass and ginger tea", 
            "salabat": "lemongrass and ginger tea",
            "chichacorn": "chichacorn", "cornick": "chichacorn", "mais": "chichacorn",
            "ube wine": "ube wine", "ube": "ube wine", "purple yam": "ube wine", "halayang ube": "ube wine",
            "bamboo": "bamboo crafts", "bamboo crafts": "bamboo crafts", "kawayan": "bamboo crafts",
            "furniture": "wood furniture", "wood": "wood furniture", "kagamitan sa bahay": "wood furniture", "upan": "wood furniture",
            "bangus": "milkfish", "milkfish": "milkfish", "isda": "milkfish",
            "walis": "colored soft broom"
        }

        signature_products = {
            "agoo": ["mushrooms"],
            "aringay": ["milkfish"],
            "bacnotan": ["honey"],
            "bagulin": ["Tiger Grass Soft Broom"],
            "balaoan": ["sea urchins"],
            "bangar": ["inabel towel"],
            "bauang": ["grapes"],
            "burgos": ["colored soft broom"],
            "caba": ["bamboo crafts"],
            "luna": ["pebble crafts"],
            "naguilian": ["basi"],
            "pugo": ["wood furniture"],
            "rosario": ["wood furniture"],
            "san fernando": ["colored soft broom", "lemongrass and ginger tea", "ube wine"],
            "san gabriel": ["coffee"],
            "san juan": ["damili"],
            "santol": ["coffee"],
            "santo tomas": ["dried fish"],
            "sudipen": ["Labtang Basket"],
            "tubao": ["chichacorn"]
        }

        products = signature_products.get(town.lower(), [])
        if not products:
            dispatcher.utter_message(text=f"No signature products found for {town}. Try asking about specific products or other towns!")
            return [SlotSet("products", None), SlotSet("store_name", None)]

        # Map synonyms to canonical names for display
        product_list = ", ".join(synonym_map.get(p.lower(), p) for p in products)
        dispatcher.utter_message(text=f"{town} is famous for these signature products: {product_list}")
        if "where" in tracker.latest_message.get("text", "").lower():
            products_mapped = [synonym_map.get(p.lower(), p.lower()) for p in products]
            matched_products = [p for p in data["products"] if any(pm in p["name"].lower() or pm in p["description"].lower() for pm in products_mapped)]
            store_ids = set(p["store_id"] for p in matched_products if "store_id" in p)
            stores = [s for s in data["stores"] if s["store_id"] in store_ids and clean_town_name(s["town"]).lower() == town.lower()]
            store_name = stores[0]["name"] if stores else "local shops"
            return [SlotSet("products", product_list), SlotSet("store_name", store_name)]
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchStoresByTown(Action):
    def name(self) -> Text:
        return "action_fetch_stores_by_town"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching stores for town: {town}")
        if not town:
            dispatcher.utter_message(text="Ooh, which La Union town are we exploring today?")
            return [SlotSet("stores", None), SlotSet("products", None)]

        stores = [s for s in data["stores"] if clean_town_name(s["town"]).lower() == town.lower()]
        if not stores:
            dispatcher.utter_message(text=f"No stores found in {town}. Try another town or check out nearby places like San Fernando!")
            return [SlotSet("stores", None), SlotSet("products", None)]

        store_list = ", ".join(sorted(set(s["name"] for s in stores)))
        dispatcher.utter_message(text=f"Here are the stores in {town}: {store_list}")
        return [SlotSet("stores", store_list), SlotSet("products", None)]