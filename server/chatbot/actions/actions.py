from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import json
import os
import re
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load JSON data from the same directory as actions.py
file_path = os.path.join(os.path.dirname(__file__), "database_data_processed.json")
with open(file_path, "r", encoding="utf-8") as file:
    data = json.load(file)

def clean_town_name(town: str) -> str:
    """Clean town name by removing extra spaces and standardizing."""
    if not town:
        return town
    town = re.sub(r'\s+', ' ', town.strip().lower())
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
            dispatcher.utter_message(response="utter_ask_town")
            return [SlotSet("products", None)]

        if town.lower() == "la union":
            products = data["products"]
        else:
            products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        
        logger.debug(f"Found {len(products)} products for {town}: {[p['name'] for p in products]}")
        
        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"Ay, no products found in {town} yet. {nearby_suggestion}")
            return [SlotSet("products", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(response="utter_product_list", town=town, products=product_list)
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductsByCategory(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_category"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        category = tracker.get_slot("product_category")
        if not category:
            dispatcher.utter_message(response="utter_ask_category")
            return [SlotSet("products", None)]

        products = [p for p in data["products"] if p["category"].lower() == category.lower()]
        if not products:
            dispatcher.utter_message(text=f"No {category} found. Maybe try snacks or crafts?")
            return [SlotSet("products", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(response="utter_category_list", product_category=category, products=product_list)
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchStoreDetails(Action):
    def name(self) -> Text:
        return "action_fetch_store_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        store_name = tracker.get_slot("store_name")
        if not store_name:
            dispatcher.utter_message(response="utter_ask_store")
            return [SlotSet("description", None)]

        store = next((s for s in data["stores"] if s["name"].lower().startswith(store_name.lower())), None)
        if not store:
            dispatcher.utter_message(text=f"No details found for {store_name}. Try another store!")
            return [SlotSet("description", None)]

        dispatcher.utter_message(response="utter_store_details", store_name=store["name"], description=store["description"])
        return [SlotSet("description", store["description"]), SlotSet("products", None)]

class ActionFetchStoreLocation(Action):
    def name(self) -> Text:
        return "action_fetch_store_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        store_name = tracker.get_slot("store_name")
        if not store_name:
            dispatcher.utter_message(response="utter_ask_store")
            return [SlotSet("operating_hours", None), SlotSet("phone", None)]

        store = next((s for s in data["stores"] if s["name"].lower().startswith(store_name.lower())), None)
        if not store:
            dispatcher.utter_message(text=f"No location found for {store_name}. Try another store!")
            return [SlotSet("operating_hours", None), SlotSet("phone", None)]

        dispatcher.utter_message(
            response="utter_store_location",
            store_name=store["name"],
            town=clean_town_name(store["town"]),
            operating_hours=store["operating_hours"] or "Not available",
            phone=store["phone"] or "Not available"
        )
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
        if not product_name:
            dispatcher.utter_message(response="utter_ask_product")
            return [SlotSet("products", None)]

        products = [p for p in data["products"] if product_name.lower() in p["name"].lower()]
        if not products:
            dispatcher.utter_message(response="utter_product_not_found", product_name=product_name)
            return [SlotSet("products", None)]

        towns = sorted(set(clean_town_name(p["town"]) for p in products))
        product_list = f"{product_name} (available in {', '.join(towns)})"
        dispatcher.utter_message(response="utter_product_list", town=", ".join(towns), products=product_list)
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductAvailability(Action):
    def name(self) -> Text:
        return "action_fetch_product_availability"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name")
        if not product_name:
            dispatcher.utter_message(response="utter_ask_product")
            return [SlotSet("products", None)]

        products = [p for p in data["products"] if product_name.lower() in p["name"].lower()]
        if not products:
            dispatcher.utter_message(response="utter_product_availability_no", product_name=product_name)
            return [SlotSet("products", None)]

        dispatcher.utter_message(response="utter_product_availability_yes", product_name=product_name)
        return [SlotSet("products", product_name)]

class ActionFetchProductLocation(Action):
    def name(self) -> Text:
        return "action_fetch_product_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name")
        if not product_name:
            dispatcher.utter_message(response="utter_ask_product")
            return []

        products = [p for p in data["products"] if product_name.lower() in p["name"].lower()]
        if not products:
            dispatcher.utter_message(response="utter_product_not_found", product_name=product_name)
            return []

        town = clean_town_name(products[0]["town"])
        stores = [s for s in data["stores"] if clean_town_name(s["town"]).lower() == town.lower()]
        store_name = stores[0]["name"] if stores else "local shops"
        dispatcher.utter_message(response="utter_product_location", product_name=product_name, store_name=store_name, town=town)
        return [SlotSet("store_name", store_name)]

class ActionFetchProductsByLocation(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        logger.debug(f"Fetching products by location for town: {town}")
        if not town:
            dispatcher.utter_message(response="utter_ask_town")
            return [SlotSet("products", None)]

        if town.lower() == "la union":
            products = data["products"]
        else:
            products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        
        logger.debug(f"Found {len(products)} products for {town}: {[p['name'] for p in products]}")
        
        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"Ay, no products found in {town} yet. {nearby_suggestion}")
            return [SlotSet("products", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(response="utter_products_by_location", town=town, products=product_list)
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchProductsByType(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_type"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_type = tracker.get_slot("product_type")
        if not product_type:
            dispatcher.utter_message(response="utter_ask_category")
            return [SlotSet("products", None)]

        type_mapping = {
            "spicy": ["spicy", "hot"],
            "sweet": ["sweet", "dessert", "sugary"],
            "snacks": ["chips", "snack", "talong", "okra"],
            "chocolate": ["chocolate", "cocoa"],
            "food": ["food", "bagoong", "fish", "chips"],
            "handicrafts": ["wooden", "bamboo", "woven", "pottery", "handicraft"],
            "souvenirs": ["souvenir", "craft", "inabel", "broom"],
            "pasalubong": ["bagoong", "chips", "wine", "dried fish"],
            "local snacks": ["chips", "talong", "okra"]
        }

        keywords = type_mapping.get(product_type.lower(), [product_type.lower()])
        products = [p for p in data["products"] if any(k in p["name"].lower() or k in p["description"].lower() for k in keywords)]

        if not products:
            dispatcher.utter_message(text=f"No {product_type} products found. Try something like 'snacks'!")
            return [SlotSet("products", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(response="utter_products_by_type", product_type=product_type, products=product_list)
        return [SlotSet("products", product_list), SlotSet("store_name", None)]

class ActionFetchStoreByProduct(Action):
    def name(self) -> Text:
        return "action_fetch_store_by_product"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name") or tracker.get_slot("product_category")
        town = clean_town_name(tracker.get_slot("town"))

        if not product_name:
            dispatcher.utter_message(response="utter_ask_product")
            return [SlotSet("products", None)]

        products = [p for p in data["products"] if product_name.lower() in p["name"].lower() or product_name.lower() in p["category"].lower()]
        if not products:
            dispatcher.utter_message(response="utter_product_not_found", product_name=product_name)
            return [SlotSet("products", None)]

        if town and town.lower() != "la union":
            products = [p for p in products if clean_town_name(p["town"]).lower() == town.lower()]

        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"No stores found for {product_name} in {town}. {nearby_suggestion}")
            return [SlotSet("products", None)]

        store = next((s for s in data["stores"] if s["name"] == products[0]["store_name"]), None)
        if not store:
            dispatcher.utter_message(text=f"No store details available for {product_name}. Try another product!")
            return [SlotSet("products", None)]

        dispatcher.utter_message(
            response="utter_store_by_product",
            product_name=product_name,
            store_name=store["name"],
            town=clean_town_name(store["town"])
        )
        return [SlotSet("store_name", store["name"]), SlotSet("products", product_name)]

class ActionFetchRecommendation(Action):
    def name(self) -> Text:
        return "action_fetch_recommendation"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        if town and town.lower() != "la union":
            products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        else:
            products = data["products"]

        if not products:
            dispatcher.utter_message(text="No products available to recommend. Check back later!")
            return [SlotSet("products", None)]

        popular_products = [p for p in products if any(keyword in p["name"].lower() for keyword in ["basi", "chips", "grapes", "inabel"])]
        if not popular_products:
            popular_products = products[:5]

        product_list = ", ".join(sorted(set(p["name"] for p in popular_products)))
        dispatcher.utter_message(response="utter_recommendation", products=product_list)
        return [SlotSet("products", product_list)]

class ActionFetchLocationNearMe(Action):
    def name(self) -> Text:
        return "action_fetch_location_near_me"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        town = clean_town_name(tracker.get_slot("town"))
        if not town:
            dispatcher.utter_message(response="utter_location_near_me")
            return []

        products = [p for p in data["products"] if clean_town_name(p["town"]).lower() == town.lower()]
        if not products:
            nearby_towns = sorted(set(clean_town_name(p["town"]) for p in data["products"] if p["town"].lower() != town.lower()))
            nearby_suggestion = f"Check out nearby towns like {', '.join(nearby_towns[:2])}!" if nearby_towns else "Try another town!"
            dispatcher.utter_message(text=f"No products found near {town}. {nearby_suggestion}")
            return [SlotSet("products", None)]

        product_list = ", ".join(sorted(set(p["name"] for p in products)))
        dispatcher.utter_message(response="utter_products_by_location", town=town, products=product_list)
        return [SlotSet("products", product_list)]

class ActionFetchProductDetails(Action):
    def name(self) -> Text:
        return "action_fetch_product_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product_name = tracker.get_slot("product_name")
        if not product_name:
            dispatcher.utter_message(response="utter_ask_product")
            return [SlotSet("products", None)]

        product = next((p for p in data["products"] if product_name.lower() in p["name"].lower()), None)
        if not product:
            dispatcher.utter_message(response="utter_product_not_found", product_name=product_name)
            return [SlotSet("products", None)]

        dispatcher.utter_message(
            response="utter_product_details",
            product_name=product["name"],
            description=product["description"]
        )
        return [SlotSet("products", product["name"])]