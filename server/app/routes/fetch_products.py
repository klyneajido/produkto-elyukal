#routes/fetch_products.py
from fastapi import APIRouter, HTTPException
from db.database import supabase_client
from schemas.product import Products
from typing import List

router = APIRouter()

@router.get("/search_products/{product_name}")
async def search_products_by_name(product_name: str):
    try:
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).ilike("name", f"%{product_name}%").execute()

        if not response.data:
            return {"products": []}

        products = response.data

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
        print(f"Error searching products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_product/{product_id}")
async def fetch_product(product_id: str):
    try:
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("id", product_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")

        product = response.data

        ratings_response = (
            supabase_client.table("reviews")
            .select("rating")
            .eq("product_id", product["id"])
            .execute()
        )
        ratings = [r["rating"] for r in ratings_response.data]
        product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
        product["total_reviews"] = len(ratings)

        return {"product": product}

    except Exception as e:
        print(f"Error fetching product: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_products")
async def fetch_products():
    try:
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min,price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="No products found")

        products = response.data

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

@router.get("/fetch_products_by_municipality/{municipality_id}")
async def fetch_products_by_municipality(municipality_id: str):
    try:
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("town", municipality_id).execute()

        if not response.data:
            return {"products": []}

        products = response.data

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
        print(f"Error fetching products by municipality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_similar_products/{product_id}")
async def fetch_similar_products(product_id: str):
    try:
        reference_product = supabase_client.table("products").select(
            "id, name, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("id", product_id).single().execute()

        if not reference_product.data:
            raise HTTPException(status_code=404, detail="Reference product not found")

        ref_name = reference_product.data["name"].strip()

        response = supabase_client.table("products").select(
            "id, name, description, category, price_min,price_max, ar_asset_url, image_urls, address, in_stock, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("name", ref_name).neq("id", product_id).execute()

        if not response.data:
            print(f"No similar products found for name: '{ref_name}'")
            return {"similar_products": []}

        similar_products = response.data
        print(f"Found similar products: {similar_products}")

        for product in similar_products:
            ratings_response = (
                supabase_client.table("reviews")
                .select("rating")
                .eq("product_id", product["id"])
                .execute()
            )
            ratings = [r["rating"] for r in ratings_response.data]
            product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)

        return {"similar_products": similar_products}

    except Exception as e:
        print(f"Error fetching similar products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_popular_products")
async def fetch_popular_products():
    try:
        response = supabase_client.table('products').select(
            "id, name, description, category, price_min,price_max, ar_asset_url, image_urls, address, in_stock, store_id, "
            "stores(name, store_id, latitude, longitude, store_image, type, rating)"
        ).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="No products found")
        
        products = response.data
        
        for product in products:
            ratings_response = supabase_client.table("reviews").select("rating").eq("product_id", product["id"]).execute()
            ratings = [r["rating"] for r in ratings_response.data] if ratings_response.data else []
            product["average_rating"] = "{:.1f}".format(round(sum(ratings)/len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)
        
        sorted_products = sorted(products, key=lambda x: x["average_rating"], reverse=True)[:4]
        
        return {"products": sorted_products}
    
    except Exception as e:
        print(f"Error fetching products: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {type(e).__name__}: {str(e)}")

@router.put("/add_view_to_product/{product_id}")
def increment_views(product_id: str):
    try:
        response = supabase_client.table("products").select("views").eq("id", product_id).execute()
        views = response.data[0]["views"]
        new_views = views + 1
        response = supabase_client.table("products").update({"views": new_views}).eq("id", product_id).execute()
        
        print(response)
    except Exception as e:
        print(f"Error incrementing views: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=404, detail="Product not found")