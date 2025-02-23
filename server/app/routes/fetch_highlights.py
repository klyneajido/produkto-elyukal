from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.highlights import Highlight
from typing import List

router = APIRouter()

@router.get("/fetch_highlights", response_model=List[Highlight])
async def fetch_highlights():
    try:
        # Logging for debugging
        print("Connecting to Supabase to fetch festival highlights...")

        response = supabase_client.table("festival_highlights").select(
            "id, event_id, title, description, icon"
        ).execute()

        print("Supabase Response:", response)

        if not response.data:
            print("No highlights found")
            raise HTTPException(status_code=404, detail="No festival highlights found")

        return response.data

    except Exception as e:
        print(f"Error in fetch_highlights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
