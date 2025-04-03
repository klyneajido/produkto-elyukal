from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.stores import Store
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
        
        # Safely log the response data
        print("Supabase Response received. Data length:", len(response.data) if response.data else 0)
        # Avoid printing raw data directly; inspect it safely
        if response.data:
            print("First store sample:", json.dumps(response.data[0], ensure_ascii=False))
        else:
            print("No data found in response")
            raise HTTPException(status_code=404, detail="No stores found")
        
        return response.data
        
    except Exception as e:
        print(f"Error in fetch_stores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")