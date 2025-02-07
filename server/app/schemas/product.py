from pydantic import BaseModel
from typing import List

class Products(BaseModel):
    name:str
    description:str
    category:str
    price:int
    location_name:str
    address:str
    latitude:str
    longitude:str
    ar_asset_url:str
    image_urls:List[str]
    in_stock:bool
