#routes/fetch_events.py
from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.events import Event
from typing import List

router = APIRouter()

@router.get("/fetch_events", response_model=List[Event])
async def fetch_events():
    try:
        print("Attempting to fetch events with columns...")
        query = supabase_client.table("events").select(
            "id, title, date, start_time, end_time, location, category, description, image_url, ticket_availability, entrance_fee, town"
        )
        print("Supabase Query:", query)
        response = query.execute()
        
        print("Raw Supabase Response:", response)
        print("Response Data:", response.data)
        print("Response Keys in First Item:", 
              list(response.data[0].keys()) if response.data else "No data")

        if not response.data:
            print("No events found")
            return []  # Return empty list instead of raising 404

        return response.data

    except Exception as e:
        print(f"Error in fetch_events: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_events/municipality/{municipality_id}", response_model=List[Event])
async def fetch_events_by_municipality(municipality_id: str):
    try:
        print(f"Attempting to fetch events for municipality ID: {municipality_id}")

        # Verify that the municipality exists
        municipality_check = supabase_client.table("municipalities").select("id").eq("id", municipality_id).execute()
        if not municipality_check.data:
            print(f"Municipality with ID {municipality_id} not found")
            raise HTTPException(status_code=404, detail="Municipality not found")

        # Query events where the town column matches the municipality_id
        query = supabase_client.table("events").select(
            "id, title, date, start_time, end_time, location, category, description, image_url, ticket_availability, entrance_fee, town"
        ).eq("town", municipality_id)
        
        print("Supabase Query:", query)
        response = query.execute()
        
        print("Raw Supabase Response:", response)
        print("Response Data:", response.data)
        print("Response Keys in First Item:", 
              list(response.data[0].keys()) if response.data else "No data")

        if not response.data:
            print(f"No events found for municipality ID: {municipality_id}")
            return []  # Return empty list instead of raising 404

        return response.data

    except Exception as e:
        print(f"Error in fetch_events_by_municipality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")