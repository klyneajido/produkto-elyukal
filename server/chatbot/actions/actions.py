from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from rasa_sdk.types import DomainDict

# Mock data to simulate Supabase until the real database is ready
MOCK_DATA = {
    "municipalities": {
        "San Juan": {"description": "known for surfing and coffee"},
        "Agoo": {"description": "famous for pottery and crafts"},
        "San Fernando": {"description": "the bustling capital with markets"},
    },
    "products": [
        {"name": "Coffee Beans", "category": "Food", "description": "Rich local brew", "price_range": "₱200-300", "availability": "Year-round", "town": "San Juan"},
        {"name": "Pottery", "category": "Crafts", "description": "Handmade clay pots", "price_range": "₱500-800", "availability": "Seasonal", "town": "Agoo"},
        {"name": "Handwoven Bags", "category": "Crafts", "description": "Traditional weaves", "price_range": "₱300-600", "availability": "Year-round", "town": "San Fernando"},
        {"name": "Rice Wine", "category": "Beverage", "description": "Fermented tapuey", "price_range": "₱150-250", "availability": "Seasonal", "town": "San Juan"},
    ]
}
class ValidateMunicipalityForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_municipality_form"

    def validate_municipality(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate municipality value."""
        # Check if slot is already filled with valid value
        current_value = tracker.get_slot("municipality")
        if current_value in MOCK_DATA["municipalities"]:
            return {"municipality": current_value}
            
        if not slot_value:
            dispatcher.utter_message(text="Which municipality are you curious about? San Juan, maybe?")
            return {"municipality": None}
            
        if slot_value not in MOCK_DATA["municipalities"]:
            dispatcher.utter_message(text=f"I don't know {slot_value}. Did you mean San Juan or San Fernando?")
            return {"municipality": None}
            
        return {"municipality": slot_value}
    
    def name(self) -> Text:
        return "validate_municipality_form"

    def validate_municipality(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate municipality value."""
        if not slot_value:
            dispatcher.utter_message(text="Which municipality are you curious about? San Juan, maybe?")
            return {"municipality": None}
            
        if slot_value not in MOCK_DATA["municipalities"]:
            dispatcher.utter_message(text=f"I don't know {slot_value}. Did you mean San Juan or San Fernando?")
            return {"municipality": None}
            
        return {"municipality": slot_value}

class ValidateProductLocationForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_product_location_form"

    def validate_product(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate product value for location questions."""
        if not slot_value:
            dispatcher.utter_message(text="Which product's origin are you looking for? Coffee Beans, Pottery, something else?")
            return {"product": None}
            
        if not any(p["name"] == slot_value for p in MOCK_DATA["products"]):
            dispatcher.utter_message(text=f"I don't have {slot_value} in my list. Maybe Coffee Beans or Handwoven Bags?")
            return {"product": None}
            
        return {"product": slot_value}

class ValidateProductPriceForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_product_price_form"

    def validate_product(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate product value for price questions."""
        if not slot_value:
            dispatcher.utter_message(text="Which product's price are you asking about? Coffee Beans, Pottery, something else?")
            return {"product": None}
            
        if not any(p["name"] == slot_value for p in MOCK_DATA["products"]):
            dispatcher.utter_message(text=f"I don't have price info for {slot_value}. Try Coffee Beans or Handwoven Bags?")
            return {"product": None}
            
        return {"product": slot_value}

class ValidateProductAvailabilityForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_product_availability_form"

    def validate_product(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate product value for availability questions."""
        if not slot_value:
            dispatcher.utter_message(text="Which product's availability are you asking about? Coffee Beans, Pottery, something else?")
            return {"product": None}
            
        if not any(p["name"] == slot_value for p in MOCK_DATA["products"]):
            dispatcher.utter_message(text=f"I don't have availability info for {slot_value}. Try Coffee Beans or Pottery?")
            return {"product": None}
            
        return {"product": slot_value}

class ValidateProductDetailsForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_product_details_form"

    def validate_product(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate product value for detail questions."""
        if not slot_value:
            dispatcher.utter_message(text="Which product would you like details about? Coffee Beans, Pottery, something else?")
            return {"product": None}
            
        if not any(p["name"] == slot_value for p in MOCK_DATA["products"]):
            dispatcher.utter_message(text=f"I don't have details for {slot_value}. Try Coffee Beans or Handwoven Bags?")
            return {"product": None}
            
        return {"product": slot_value}

class ActionFetchProductsByMunicipality(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_municipality"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        municipality = tracker.get_slot("municipality")
        products = [p for p in MOCK_DATA["products"] if p["town"] == municipality]
        mun_info = MOCK_DATA["municipalities"].get(municipality, {"description": "a part of La Union"})

        if products:
            product_details = [f"*{p['name']}* ({p['category']}): {p['description']}" for p in products]
            response_text = (
                f"In {municipality}, check out these local gems:\n"
                f"{'; '.join(product_details)}.\n"
                f"{municipality} is {mun_info['description'].lower()}. Want more details?"
            )
        else:
            response_text = (
                f"No products listed for {municipality} yet, but it's {mun_info['description'].lower()}. "
                "Try San Juan or Agoo for some cool finds!"
            )
        dispatcher.utter_message(text=response_text)
        return [SlotSet("municipality", municipality)]

class ActionFindMunicipalityByProduct(Action):
    def name(self) -> Text:
        return "action_find_municipality_by_product"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")
        matches = [p for p in MOCK_DATA["products"] if p["name"] == product]

        if matches:
            locations = [f"{p['town']}: {p['description']}" for p in matches]
            response_text = (
                f"*{product}* is found in:\n"
                f"{'; '.join(locations)}.\n"
                "Which spot interests you?"
            )
        else:
            response_text = (
                f"I don't have *{product}* yet. Try Coffee Beans or Pottery!"
            )
        dispatcher.utter_message(text=response_text)
        return [SlotSet("product", product)]

class ActionGetProductPrice(Action):
    def name(self) -> Text:
        return "action_get_product_price"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")
        matches = [p for p in MOCK_DATA["products"] if p["name"] == product]

        if matches:
            price_info = [f"In {p['town']}: {p['price_range']}" for p in matches]
            response_text = (
                f"*{product}* prices:\n"
                f"{'; '.join(price_info)}.\n"
                "Prices may vary by season!"
            )
        else:
            response_text = f"No price info for *{product}* yet. Try Coffee Beans!"
        dispatcher.utter_message(text=response_text)
        return []

class ActionGetProductAvailability(Action):
    def name(self) -> Text:
        return "action_get_product_availability"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")
        matches = [p for p in MOCK_DATA["products"] if p["name"] == product]

        if matches:
            avail_info = [f"In {p['town']}: {p['availability']}" for p in matches]
            response_text = (
                f"*{product}* availability:\n"
                f"{'; '.join(avail_info)}."
            )
        else:
            response_text = f"No availability info for *{product}* yet. Try Pottery!"
        dispatcher.utter_message(text=response_text)
        return []

class ActionProvideProductDetails(Action):
    def name(self) -> Text:
        return "action_provide_product_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")
        matches = [p for p in MOCK_DATA["products"] if p["name"] == product]

        if matches:
            response_parts = [f"About *{product}*:"]
            for p in matches:
                response_parts.append(f"{p['description']} (from {p['town']})")
            response_text = "\n".join(response_parts)
        else:
            response_text = f"No details for *{product}* yet. Try Handwoven Bags!"
        dispatcher.utter_message(text=response_text)
        return []