from pydantic import BaseModel
from typing import List, Union
from uuid import UUID

class Products(BaseModel):
    name:str
    description:str
    category:str
    price:float
    location_name:str
    address:str
    latitude:str
    longitude:str
    ar_asset_url:str
    image_urls:List[str]
    in_stock:bool
    rating:float
    store_id: Union[UUID, str]
