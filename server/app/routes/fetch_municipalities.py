#routes/fetch_municipalities.py
from fastapi import APIRouter, HTTPException
from db.database import supabase_client
from schemas.municipalities import Municipality
from typing import List

router = APIRouter()

@router.get("/fetch_municipalities", response_model=List[Municipality])
async def fetch_municipalities():
    try:
        print("Attempting to connect to Supabase...")

        # Query the municipalities table
        response = supabase_client.table("municipalities").select("*").execute()

        print("Supabase Response:", response)

        if not response.data:
            print("No data found in response")
            raise HTTPException(status_code=404, detail="No municipalities found")

        return response.data

    except Exception as e:
        print(f"Error in fetch_municipalities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{municipality_id}", response_model=Municipality)
async def fetch_municipality(municipality_id: str):
    try:
        print(f"Fetching municipality with ID: {municipality_id}")

        # Query the municipalities table for a specific ID
        response = supabase_client.table("municipalities").select("*").eq("id", municipality_id).execute()

        print("Supabase Response:", response)

        if not response.data:
            print("No data found in response")
            raise HTTPException(status_code=404, detail="Municipality not found")

        # Since we're querying by ID, there should only be one result
        return response.data[0]

    except Exception as e:
        print(f"Error in fetch_municipality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")