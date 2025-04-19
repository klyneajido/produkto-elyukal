#routes/fetch_stores.py
from fastapi import APIRouter, HTTPException
from db.database import supabase_client
from schemas.stores import Store
from typing import List
import json

router = APIRouter()

@router.get("/fetch_stores", response_model=List[Store])
async def fetch_stores():
    try:
        print("Attempting to connect to Supabase...")
        
        # Query the stores table
        response = supabase_client.table("stores").select(
            "store_id, name, description, latitude, longitude, rating, store_image, type, operating_hours, phone"
        ).execute()
        
        print("Supabase Response received. Data length:", len(response.data) if response.data else 0)
        if response.data:
            print("First store sample:", json.dumps(response.data[0], ensure_ascii=False))
        else:
            print("No data found in response")
            raise HTTPException(status_code=404, detail="No stores found")
        
        return response.data

    except Exception as e:
        print(f"Error in fetch_stores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/search_stores/{store_name}")
async def search_stores_by_name(store_name: str):
    try:
        print(f"Searching for stores with name: {store_name}")
        
        # Clean the store name by removing parentheses and special characters
        cleaned_store_name = store_name.replace("(", "").replace(")", "").strip()
        
        # Query the stores table with case-insensitive partial match
        response = supabase_client.table("stores").select(
            "store_id, name, description, latitude, longitude, rating, store_image, type, operating_hours, phone, town"
        ).ilike("name", f"%{cleaned_store_name}%").execute()

        print(f"Search results: {response.data if response.data else 'No results found'}")
        
        if not response.data:
            return {"stores": []}
            
        # Clean the response data to ensure all text is properly encoded
        cleaned_stores = []
        for store in response.data:
            cleaned_store = {
                "store_id": store.get("store_id", ""),
                "name": store.get("name", "").encode('utf-8', 'ignore').decode('utf-8'),
                "description": store.get("description", "").encode('utf-8', 'ignore').decode('utf-8'),
                "latitude": store.get("latitude"),
                "longitude": store.get("longitude"),
                "rating": store.get("rating", 0),
                "store_image": store.get("store_image", ""),
                "type": store.get("type", "").encode('utf-8', 'ignore').decode('utf-8'),
                "operating_hours": store.get("operating_hours", "").encode('utf-8', 'ignore').decode('utf-8'),
                "phone": store.get("phone", ""),
                "town": store.get("town", "").encode('utf-8', 'ignore').decode('utf-8')
            }
            cleaned_stores.append(cleaned_store)
            
        return {"stores": cleaned_stores}

    except Exception as e:
        print(f"Error searching stores: {str(e)}")
        # Return empty result instead of throwing 500 error
        return {"stores": []}

@router.get("/fetch_stores_by_town/{town}")
async def fetch_stores_by_town(town: str):
    try:
        print(f"Fetching stores for town: {town}")
        
        response = supabase_client.table("stores").select(
            "store_id, name, description, latitude, longitude, rating, store_image, type, operating_hours, phone"
        ).eq("town", town).execute()

        if not response.data:
            return {"stores": []}

        stores = [{
            "id": store["store_id"],
            "name": store["name"],
            "description": store["description"],
            "image_url": store["store_image"],
            "rating": store["rating"],
            "type": store["type"],
            "operating_hours": store["operating_hours"],
            "phone": store["phone"]
        } for store in response.data]

        return {"stores": stores}

    except Exception as e:
        print(f"Error fetching stores by town: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
