from pydantic import BaseModel

class Highlight(BaseModel):
    id: str
    event_id: str
    title: str
    description: str
    icon: str
