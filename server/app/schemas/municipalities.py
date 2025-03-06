# app/schemas/municipalities.py
from pydantic import BaseModel
from typing import Optional

class Municipality(BaseModel):
    id: str
    name: str
    description: str
    image_url: str
    created_at: Optional[str] = None  

    class Config:
        orm_mode = True 