"""
Database connector for the Rasa chatbot to interact with Supabase.
"""
import sys
import os
from pathlib import Path
import asyncio

# Add the server directory to sys.path
server_dir = str(Path(__file__).resolve().parent.parent)
if server_dir not in sys.path:
    sys.path.append(server_dir)

# Import the Supabase client
try:
    from app.db.database import supabase_client
    from app.core.config import settings
    print(f"Successfully imported Supabase client with URL: {settings.SUPABASE_URL}")
except ImportError as e:
    print(f"Error importing Supabase client: {e}")
    raise

class DatabaseConnector:
    """
    Class to handle database operations for the Rasa chatbot.
    """
    @staticmethod
    async def get_municipalities():
        """
        Get all municipalities from the database.
        """
        try:
            print("Attempting to fetch municipalities from Supabase...")
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("municipalities").select("*").execute()
            )
            print(f"Municipalities response: {response}")
            if response.data:
                municipalities = {item["name"]: item for item in response.data}
                print(f"Found {len(municipalities)} municipalities")
                return municipalities
            print("No municipalities found in database")
            return {}
        except Exception as e:
            print(f"Error fetching municipalities: {str(e)}")
            return {}

    @staticmethod
    async def get_products():
        """
        Get all products with their details from the database.
        """
        try:
            print("Attempting to fetch products from Supabase...")
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("products").select(
                    "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
                ).execute()
            )
            print(f"Products response: {len(response.data) if response.data else 0} items")
            if response.data:
                products = []
                for item in response.data:
                    if not item:
                        print("Skipping empty item in products")
                        continue
                    store_info = item.get("stores", {}) or {}
                    town_id = store_info.get("town", "Unknown")
                    product = {
                        "name": item.get("name", "Unknown"),
                        "category": item.get("category", "Unknown"),
                        "description": item.get("description", "No description"),
                        "price_range": f"₱{item.get('price_min', 0)}-{item.get('price_max', 0)}",
                        "availability": "Year-round" if item.get("in_stock", False) else "Currently unavailable",
                        "town": town_id,
                        "store_id": item.get("store_id", "Unknown"),
                        "store_name": store_info.get("name", "Unknown")
                    }
                    products.append(product)
                print(f"Processed {len(products)} products")
                return products
            print("No products found in database")
            return []
        except Exception as e:
            print(f"Error fetching products: {str(e)}")
            return []

    @staticmethod
    async def get_stores():
        """
        Get all stores from the database.
        """
        try:
            print("Attempting to fetch stores from Supabase...")
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("stores").select(
                    "store_id, name, description, latitude, longitude, rating, store_image, type, operating_hours, phone, town"
                ).execute()
            )
            print(f"Stores response: {len(response.data) if response.data else 0} items")
            if response.data:
                stores = []
                for item in response.data:
                    store = {
                        "name": item.get("name", "Unknown"),
                        "description": item.get("description", "No description"),
                        "town": item.get("town", "Unknown"),
                        "rating": item.get("rating", 0),
                        "type": item.get("type", "General"),
                        "operating_hours": item.get("operating_hours", "Not specified"),
                        "phone": item.get("phone", "Not available")
                    }
                    stores.append(store)
                print(f"Processed {len(stores)} stores")
                return stores
            print("No stores found in database")
            return []
        except Exception as e:
            print(f"Error fetching stores: {str(e)}")
            return []

    @staticmethod
    async def get_stores_by_municipality(municipality):
        """
        Get stores from a specific municipality by resolving town name to ID.
        """
        try:
            print(f"Fetching stores for municipality: {municipality}")
            loop = asyncio.get_event_loop()
            municipality_response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("municipalities").select("id").eq("name", municipality).execute()
            )
            if not municipality_response.data:
                print(f"No municipality found for: {municipality}")
                return []
            municipality_id = municipality_response.data[0]["id"]

            response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("stores").select(
                    "store_id, name, description, latitude, longitude, rating, store_image, type, operating_hours, phone, town"
                ).eq("town", municipality_id).execute()
            )
            print(f"Stores response: {len(response.data) if response.data else 0} items")
            if response.data:
                stores = [
                    {
                        "name": item.get("name", "Unknown"),
                        "description": item.get("description", "No description"),
                        "town": municipality,
                        "rating": item.get("rating", 0),
                        "type": item.get("type", "General"),
                        "operating_hours": item.get("operating_hours", "Not specified"),
                        "phone": item.get("phone", "Not available")
                    }
                    for item in response.data
                ]
                print(f"Processed {len(stores)} stores for {municipality}")
                return stores
            print(f"No stores found for municipality ID: {municipality_id}")
            return []
        except Exception as e:
            print(f"Error fetching stores by municipality: {str(e)}")
            return []

    @staticmethod
    async def get_products_by_municipality(municipality):
        """
        Get products from a specific municipality by resolving town name to ID.
        """
        try:
            print(f"Fetching products for municipality: {municipality}")
            loop = asyncio.get_event_loop()
            municipality_response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("municipalities").select("id").eq("name", municipality).execute()
            )
            if not municipality_response.data:
                print(f"No municipality found for: {municipality}")
                return []
            municipality_id = municipality_response.data[0]["id"]
            print(f"Resolved {municipality} to ID: {municipality_id}")

            response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("products").select(
                    "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
                ).eq("stores.town", municipality_id).execute()
            )
            print(f"Raw response for {municipality} (ID: {municipality_id}): {response}")
            if not response.data:
                print(f"No products found for municipality ID: {municipality_id}")
                return []

            products = []
            for item in response.data:
                if not item:
                    print(f"Skipping empty item for {municipality}")
                    continue
                store_info = item.get("stores", {}) or {}
                town_id = store_info.get("town", "Unknown")
                if town_id == "Unknown":
                    print(f"No town info for product: {item.get('name', 'Unknown')}, store_id: {item.get('store_id', 'Unknown')}")
                    continue
                product = {
                    "name": item.get("name", "Unknown"),
                    "category": item.get("category", "Unknown"),
                    "description": item.get("description", "No description"),
                    "price_range": f"₱{item.get('price_min', 0)}-{item.get('price_max', 0)}",
                    "availability": "Year-round" if item.get("in_stock", False) else "Currently unavailable",
                    "town": municipality,
                    "store_id": item.get("store_id", "Unknown"),
                    "store_name": store_info.get("name", "Unknown")
                }
                products.append(product)
            print(f"Processed {len(products)} products for {municipality}")
            return products
        except Exception as e:
            print(f"Error fetching products by municipality: {str(e)}")
            return []

    @staticmethod
    async def get_municipality_by_product(product_name):
        """
        Find municipalities where a specific product is available.
        """
        try:
            print(f"Finding municipalities for product: {product_name}")
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: supabase_client.table("products").select(
                    "id, name, store_id, stores(name, store_id, town, municipalities(name))"
                ).eq("name", product_name).execute()
            )
            print(f"Response for product {product_name}: {response}")
            if not response.data:
                print(f"No municipalities found for product: {product_name}")
                return []

            municipalities = []
            for item in response.data:
                store_info = item.get("stores", {}) or {}
                municipality_info = store_info.get("municipalities", {}) or {}
                town_name = municipality_info.get("name", "Unknown")
                if town_name == "Unknown":
                    print(f"No town info for product: {product_name}, store_id: {item.get('store_id', 'Unknown')}")
                    continue
                municipalities.append({
                    "town": town_name,
                    "store_name": store_info.get("name", "Unknown")
                })
            print(f"Found {len(municipalities)} municipalities for {product_name}")
            return municipalities
        except Exception as e:
            print(f"Error fetching municipalities by product: {str(e)}")
            return []