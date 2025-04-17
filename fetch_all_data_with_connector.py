"""
Script to fetch all data from products, stores, and municipalities tables
using the existing DatabaseConnector class and save it to a JSON file.
Ensures store_id in stores, valid store_id in products, and signature products mapping.
Products derive town from stores via store_id.
"""

import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
project_root = str(Path(__file__).resolve().parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Import the DatabaseConnector class
try:
    from server.chatbot.utils.db_connector import DatabaseConnector
    print("Successfully imported DatabaseConnector")
except ImportError as e:
    print(f"Error importing DatabaseConnector: {e}")
    print("Ensure 'server/chatbot/utils/db_connector.py' exists")
    sys.exit(1)

# Define La Union towns for validation
LA_UNION_TOWNS = [
    "Agoo", "Aringay", "Bacnotan", "Bagulin", "Balaoan", "Bangar", "Bauang",
    "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando",
    "San Gabriel", "San Juan", "Santol", "Santo Tomas", "Sudipen", "Tubao"
]

# Define signature products mapping (updated Labtang Basket to Rosario)
SIGNATURE_PRODUCTS = {
    "Agoo": ["mushrooms"],
    "Aringay": ["milkfish"],
    "Bacnotan": ["honey"],
    "Bagulin": ["rambutan"],
    "Balaoan": ["sea urchins"],
    "Bangar": ["inabel towel"],
    "Bauang": ["grapes"],
    "Burgos": ["colored soft broom"],
    "Caba": ["bamboo crafts"],
    "Luna": ["stone crafts"],
    "Naguilian": ["basi"],
    "Pugo": ["wood furniture"],
    "Rosario": ["banana", "Labtang Basket"],
    "San Fernando": ["colored soft broom", "lemongrass and ginger tea", "ube wine"],
    "San Gabriel": ["tiger grass broom"],
    "San Juan": ["damili"],
    "Santol": ["tobacco"],
    "Santo Tomas": ["dried fish"],
    "Sudipen": [],
    "Tubao": ["chichacorn"]
}

async def main():
    """
    Main function to fetch all data, process it, and save to a JSON file.
    """
    print("Starting data fetch process...")

    # Fetch all data using the DatabaseConnector
    try:
        municipalities_data = await DatabaseConnector.get_municipalities()
        products_data = await DatabaseConnector.get_products()
        stores_data = await DatabaseConnector.get_stores()
    except Exception as e:
        print(f"Error fetching data from database: {str(e)}")
        sys.exit(1)

    # Debug: Print raw data for Labtang Basket
    labtang_products = [p for p in products_data if p["name"].lower() == "labtang basket"]
    print("Raw Labtang Basket product data:", labtang_products)
    labtang_store_ids = [p["store_id"] for p in labtang_products]
    labtang_stores = [s for s in stores_data if s["id"] in labtang_store_ids]
    print("Raw Labtang Basket store data:", labtang_stores)

    # Build a map of municipality_id to name
    municipality_map = {}
    municipalities_list = []

    municipalities_source = municipalities_data.values() if isinstance(municipalities_data, dict) else municipalities_data
    for muni in municipalities_source:
        filtered_muni = {k: v for k, v in muni.items() if k not in ['image_url', 'created_at']}
        if filtered_muni.get("name") in LA_UNION_TOWNS:
            municipalities_list.append(filtered_muni)
            municipality_map[muni["id"]] = muni["name"]
        else:
            print(f"Warning: Skipping municipality {muni.get('name')} not in LA_UNION_TOWNS")

    # Process stores: Ensure store_id and valid town
    processed_stores = []
    store_id_map = {}  # Map database id to store_id
    store_town_map = {}  # Map store_id to town
    for store in stores_data:
        processed_store = store.copy()
        store_id = store.get("id", f"S{len(processed_stores) + 1:03d}")
        processed_store["store_id"] = store_id
        store_id_map[store.get("id")] = store_id
        town_id = str(store.get("town", ""))
        processed_store["town"] = municipality_map.get(town_id, "Unknown")
        store_town_map[store_id] = processed_store["town"]
        if processed_store["town"] == "Unknown":
            print(f"Warning: Store {processed_store.get('name')} has unknown town ID {town_id}")
        processed_store.pop("id", None)
        processed_store.pop("town", None)  # Remove numeric town ID
        processed_stores.append(processed_store)

    # Process products: Ensure store_id and derive town from store
    processed_products = []
    for product in products_data:
        processed_product = product.copy()
        product_store_id = product.get("store_id") or product.get("id")
        if product_store_id in store_id_map:
            processed_product["store_id"] = store_id_map[product_store_id]
            processed_product["town"] = store_town_map.get(processed_product["store_id"], "Unknown")
        else:
            default_store_id = f"S{len(processed_stores) + 1:03d}"
            processed_product["store_id"] = default_store_id
            processed_product["town"] = "Unknown"
            print(f"Warning: Product {processed_product.get('name')} has no valid store_id, assigned {default_store_id}")
            # Create a generic store
            processed_store = {
                "store_id": default_store_id,
                "name": f"Local Shop for {processed_product['name']}",
                "town": processed_product["town"],
                "description": "Generic local shop",
                "operating_hours": "Unknown",
                "phone": "N/A"
            }
            processed_stores.append(processed_store)
            store_town_map[default_store_id] = processed_product["town"]

        # Enforce correct town for signature products
        product_name_lower = product["name"].lower()
        for town, sig_products in SIGNATURE_PRODUCTS.items():
            if product_name_lower in [p.lower() for p in sig_products]:
                processed_product["town"] = town
                # Update store town if it’s a generic store
                for store in processed_stores:
                    if store["store_id"] == processed_product["store_id"] and store["town"] == "Unknown":
                        store["town"] = town
                        store_town_map[store["store_id"]] = town
                break

        if processed_product["town"] == "Unknown":
            print(f"Warning: Product {processed_product.get('name')} has unknown town")
        processed_product.pop("id", None)
        processed_products.append(processed_product)

    # Create signature products mapping
    signature_products_list = []
    for town, products in SIGNATURE_PRODUCTS.items():
        if town in LA_UNION_TOWNS:
            for product in products:
                signature_products_list.append({
                    "town": town,
                    "product_name": product
                })

    # Prepare data dictionary
    all_data = {
        "municipalities": municipalities_list,
        "products": processed_products,
        "stores": processed_stores,
        "signature_products": signature_products_list
    }

    # Save to JSON file
    output_file = "database_data_processed.json"
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_data, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved all data to {output_file}")

        # Print summary
        print("\nData Summary:")
        print(f"- Municipalities: {len(municipalities_list)}")
        print(f"- Products: {len(processed_products)}")
        print(f"- Stores: {len(processed_stores)}")
        print(f"- Signature Products: {len(signature_products_list)}")
    except Exception as e:
        print(f"Error saving data to file: {str(e)}")

    # Validate JSON structure
    try:
        for store in processed_stores:
            assert "store_id" in store, f"Missing store_id in store: {store}"
            assert store["town"] in LA_UNION_TOWNS, f"Invalid town {store['town']} in store: {store}"
        for product in processed_products:
            assert "store_id" in product, f"Missing store_id in product: {product}"
            assert product["town"] in LA_UNION_TOWNS, f"Invalid town {product['town']} in product: {product}"
        print("JSON validation passed: All stores and products have store_id and valid towns")
    except AssertionError as e:
        print(f"JSON validation failed: {str(e)}")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())