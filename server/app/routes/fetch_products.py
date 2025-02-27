# fetch_products.py
from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.product import Products
from typing import List

router = APIRouter()

@router.get("/fetch_products")
async def fetch_products():
    try:
        # Fetch products with store details
        response = supabase_client.table("products").select(
            "id, name, description, category, price, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating)"
        ).execute()

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
            product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)

        return {"products": products}

    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")