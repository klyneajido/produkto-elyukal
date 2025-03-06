from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class Event(BaseModel):
    id: str
    title: str
    date: date
    start_time: time
    end_time: time
    location: str
    category: str
    description: str
    image_url: str
    entrance_fee: float
    ticket_availability: bool
    town: Optional[str] = None
