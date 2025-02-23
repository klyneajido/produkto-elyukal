from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.events import Event
from typing import List

router = APIRouter()

@router.get("/fetch_events", response_model=List[Event])
async def fetch_events():
    try:
        # Logging for debugging
        print("Connecting to Supabase to fetch events...")

        response = supabase_client.table("events").select(
            "id, title, date, start_time, end_time, location, category, description, image_url"
        ).execute()
        
        print("Supabase Response:", response)

        if not response.data:
            print("No events found")
            raise HTTPException(status_code=404, detail="No events found")

        return response.data

    except Exception as e:
        print(f"Error in fetch_events: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
