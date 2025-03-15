from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from app.db.database import supabase_client

class ActionFetchProductsByMunicipality(Action):
    def name(self) -> Text:
        return "action_fetch_products_by_municipality"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        municipality = tracker.get_slot("municipality")

        if not municipality:
            dispatcher.utter_message(text="I need to know the municipality to find the products. Which one are you curious about?")
            return []

        # Fetch products from Supabase
        try:
            response = supabase_client.table("products").select("name, category, description, town(name)").eq("town.name", municipality).execute()
            products = response.data if response.data else []

            # Fetch municipality info for context
            mun_response = supabase_client.table("municipalities").select("name, description").eq("name", municipality).execute()
            mun_info = mun_response.data[0] if mun_response.data else {"name": municipality, "description": "a part of La Union"}

            if products:
                # Build a detailed response
                product_details = [f"*{p['name']}* ({p['category']}): {p['description']}" for p in products]
                response_text = (
                    f"In {municipality}, you can find some amazing local products! Here's what I've got:\n"
                    f"{'; '.join(product_details)}.\n"
                    f"{municipality} is known for {mun_info['description'].lower()}. "
                    "Want to know more about any of these products or what else makes this place special?"
                )
            else:
                # Smart fallback if no products are found
                response_text = (
                    f"I don't have specific products listed for {municipality} in my data, but it's still a cool spot! "
                    f"It's known for {mun_info['description'].lower()}. "
                    "Nearby towns might have some unique items—would you like suggestions from places like San Juan or Naguilian?"
                )

            dispatcher.utter_message(text=response_text)

        except Exception as e:
            dispatcher.utter_message(text=f"Sorry, I ran into an issue fetching data for {municipality}. Try again later or ask about another place!")
            print(f"Error fetching products: {str(e)}")

        return [SlotSet("municipality", municipality)]

class ActionFindMunicipalityByProduct(Action):
    def name(self) -> Text:
        return "action_find_municipality_by_product"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")

        if not product:
            dispatcher.utter_message(text="Which product are you looking for? Tell me, and I'll find where it's from!")
            return []

        # Fetch product locations from Supabase
        try:
            response = supabase_client.table("products").select("name, category, description, address, town(name)").eq("name", product).execute()
            product_matches = response.data if response.data else []

            if product_matches:
                # Handle multiple matches (e.g., Handmade Pottery in San Juan and Bacnotan)
                locations = []
                for p in product_matches:
                    town = p["town"]["name"]
                    desc = p["description"]
                    addr = p.get("address", "local vendors")
                    locations.append(f"{town} (at {addr}): {desc}")

                if len(locations) == 1:
                    response_text = (
                        f"You can find *{product}* in {locations[0]}. "
                        "It's a gem of La Union's local craftsmanship! Want more details about the town or how it's made?"
                    )
                else:
                    response_text = (
                        f"*{product}* is available in a few places in La Union:\n"
                        f"{'; '.join(locations)}.\n"
                        "Pretty cool how it pops up across the province! Which spot are you interested in?"
                    )
            else:
                response_text = (
                    f"I couldn't find *{product}* in my La Union data. It might go by a different name—any other products you're curious about? "
                    "I've got things like Coffee Beans, Handwoven Bags, and more!"
                )

            dispatcher.utter_message(text=response_text)

        except Exception as e:
            dispatcher.utter_message(text=f"Oops, something went wrong finding *{product}*. Try again or ask me something else!")
            print(f"Error finding product location: {str(e)}")

        return [SlotSet("product", product)]

class ActionGetProductPrice(Action):
    def name(self) -> Text:
        return "action_get_product_price"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")
        municipality = tracker.get_slot("municipality")

        if not product:
            dispatcher.utter_message(text="Which product's price are you interested in?")
            return []

        # Fetch product price from Supabase
        try:
            query = supabase_client.table("products").select("name, price_range, town(name)").eq("name", product)
            
            # Add municipality filter if available
            if municipality:
                response = query.eq("town.name", municipality).execute()
            else:
                response = query.execute()
                
            product_matches = response.data if response.data else []

            if product_matches:
                # If multiple price points exist, aggregate them
                if len(product_matches) > 1:
                    towns = [p["town"]["name"] for p in product_matches]
                    prices = [p.get("price_range", "Price varies") for p in product_matches]
                    
                    price_info = []
                    for i in range(len(towns)):
                        price_info.append(f"In {towns[i]}: {prices[i]}")
                    
                    response_text = (
                        f"The price of *{product}* varies by location:\n"
                        f"{'; '.join(price_info)}.\n"
                        "Prices may vary based on season and specific vendor."
                    )
                else:
                    price = product_matches[0].get("price_range", "Price varies")
                    town = product_matches[0]["town"]["name"]
                    response_text = f"In {town}, *{product}* typically costs {price}. Prices may vary based on season and specific vendor."
            else:
                response_text = f"I don't have pricing information for *{product}* in my database. Would you like to know about different products?"

            dispatcher.utter_message(text=response_text)

        except Exception as e:
            dispatcher.utter_message(text=f"Sorry, I couldn't retrieve price information for *{product}* at this time.")
            print(f"Error getting product price: {str(e)}")

        return []

class ActionGetProductAvailability(Action):
    def name(self) -> Text:
        return "action_get_product_availability"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")

        if not product:
            dispatcher.utter_message(text="Which product's availability are you asking about?")
            return []

        # Fetch product availability from Supabase
        try:
            response = supabase_client.table("products").select("name, availability, peak_season, town(name)").eq("name", product).execute()
            product_matches = response.data if response.data else []

            if product_matches:
                availability_info = []
                for p in product_matches:
                    town = p["town"]["name"]
                    avail = p.get("availability", "Available year-round")
                    peak = p.get("peak_season", "No specific peak season")
                    
                    if peak and peak != "No specific peak season":
                        availability_info.append(f"In {town}: {avail}. Peak season: {peak}")
                    else:
                        availability_info.append(f"In {town}: {avail}")
                
                if len(availability_info) == 1:
                    response_text = f"*{product}* availability: {availability_info[0]}."
                else:
                    response_text = (
                        f"*{product}* availability varies by location:\n"
                        f"{'; '.join(availability_info)}."
                    )
            else:
                response_text = (
                    f"I don't have specific availability information for *{product}*. "
                    "Most local products in La Union are available year-round, though quality and quantity may vary seasonally."
                )

            dispatcher.utter_message(text=response_text)

        except Exception as e:
            dispatcher.utter_message(text=f"Sorry, I couldn't retrieve availability information for *{product}* at this time.")
            print(f"Error getting product availability: {str(e)}")

        return []

class ActionProvideProductDetails(Action):
    def name(self) -> Text:
        return "action_provide_product_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        product = tracker.get_slot("product")

        if not product:
            dispatcher.utter_message(text="Which product would you like to know more about?")
            return []

        # Fetch product details from Supabase
        try:
            response = supabase_client.table("products").select("name, description, making_process, cultural_significance, town(name)").eq("name", product).execute()
            product_matches = response.data if response.data else []

            if product_matches:
                # Compile details from all instances of this product
                making_process = next((p.get("making_process") for p in product_matches if p.get("making_process")), None)
                cultural_significance = next((p.get("cultural_significance") for p in product_matches if p.get("cultural_significance")), None)
                description = next((p.get("description") for p in product_matches if p.get("description")), None)
                
                response_parts = [f"About *{product}*:"]
                
                if description:
                    response_parts.append(description)
                
                if making_process:
                    response_parts.append(f"Making process: {making_process}")
                
                if cultural_significance:
                    response_parts.append(f"Cultural significance: {cultural_significance}")
                
                locations = [p["town"]["name"] for p in product_matches]
                response_parts.append(f"Found in: {', '.join(locations)}")
                
                response_text = "\n\n".join(response_parts)
            else:
                response_text = f"I don't have detailed information about *{product}* in my database. Would you like to know about other local products instead?"

            dispatcher.utter_message(text=response_text)

        except Exception as e:
            dispatcher.utter_message(text=f"Sorry, I couldn't retrieve detailed information for *{product}* at this time.")
            print(f"Error getting product details: {str(e)}")

        return []

# Legacy support for old action names - these redirect to the new actions
class ActionFetchProducts(Action):
    def name(self) -> Text:
        return "action_fetch_products"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Create an instance of the new action class and run it
        return ActionFetchProductsByMunicipality().run(dispatcher, tracker, domain)

class ActionFindProductLocation(Action):
    def name(self) -> Text:
        return "action_find_product_location"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Handle the old "products" slot name vs the new "product" slot name
        product = tracker.get_slot("products")
        if product:
            # Set the new slot name for compatibility
            return [SlotSet("product", product)] + ActionFindMunicipalityByProduct().run(dispatcher, tracker, domain)
        else:
            return ActionFindMunicipalityByProduct().run(dispatcher, tracker, domain)