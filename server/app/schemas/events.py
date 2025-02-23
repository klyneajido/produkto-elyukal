from pydantic import BaseModel
from datetime import date, time

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
