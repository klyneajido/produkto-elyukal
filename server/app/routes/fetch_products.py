# fetch_products.py
from fastapi import APIRouter, Depends, HTTPException
from app.db.database import supabase_client
from app.schemas.product import Products
from datetime import timedelta

router = APIRouter();

@router.get("/fetch_products")
async def fetch_products():
    response = supabase_client.table("products").select("*").execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="No products found")
    
    return {"products":response.data}
    
