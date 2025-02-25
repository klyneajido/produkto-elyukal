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

    products = response.data

    # Fetch ratings for each product
    for product in products:
        ratings_response = (
            supabase_client.table("reviews")
            .select("rating")
            .eq("product_id", product["id"])
            .execute()
        ) 
        ratings = [r["rating"] for r in ratings_response.data]
        product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else 0
        product["total_reviews"] = len(ratings)

    return {"products": products}

    
