"""
Script to fetch all data from products, stores, and municipalities tables
using the existing DatabaseConnector class and save it to a JSON file.
"""

import sys
import os
import json
import asyncio
from pathlib import Path

# Add the server directory to sys.path
server_dir = str(Path(__file__).resolve().parent / "server")
if server_dir not in sys.path:
    sys.path.append(server_dir)

# Import the DatabaseConnector class
try:
    from server.chatbot.utils.db_connector import DatabaseConnector
    print("Successfully imported DatabaseConnector")
except ImportError as e:
    print(f"Error importing DatabaseConnector: {e}")
    print("Make sure you're running this script from the project root directory")
    sys.exit(1)

async def main():
    """
    Main function to fetch all data and save it to a file.
    """
    print("Starting data fetch process...")

    # Fetch all data using the DatabaseConnector
    municipalities_data = await DatabaseConnector.get_municipalities()
    products_data = await DatabaseConnector.get_products()
    stores_data = await DatabaseConnector.get_stores()

    # Build a map of municipality_id to name
    municipality_map = {}
    municipalities_list = []

    municipalities_source = municipalities_data.values() if isinstance(municipalities_data, dict) else municipalities_data
    for muni in municipalities_source:
        filtered_muni = {k: v for k, v in muni.items() if k not in ['image_url', 'created_at']}
        municipalities_list.append(filtered_muni)
        municipality_map[muni["id"]] = muni["name"]

    # Replace municipality_id in products (optional)
    for product in products_data:
        if "municipality_id" in product:
            product["municipality_name"] = municipality_map.get(product["municipality_id"], "Unknown")
            product.pop("municipality_id", None)

    # Replace town numeric ID with actual town name (for Rasa)
    town_id_to_name = {str(k): v for k, v in municipality_map.items()}

    for product in products_data:
        town_id = str(product.get("town", ""))
        product["town"] = town_id_to_name.get(town_id, "Unknown")

    for store in stores_data:
        town_id = str(store.get("town", ""))
        store["town"] = town_id_to_name.get(town_id, "Unknown")

    # Prepare data dictionary
    all_data = {
        "municipalities": municipalities_list,
        "products": products_data,
        "stores": stores_data
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
        print(f"- Products: {len(products_data)}")
        print(f"- Stores: {len(stores_data)}")
    except Exception as e:
        print(f"Error saving data to file: {str(e)}")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
