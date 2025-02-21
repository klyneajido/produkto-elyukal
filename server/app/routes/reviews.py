from fastapi import APIRouter, Depends, HTTPException
from app.db.database import supabase_client
from app.schemas.review import ReviewCreate, ReviewResponse
from app.auth.auth_handler import get_current_user
from typing import List

router = APIRouter()

# Submit a review (Registered users only)
@router.post("/")
async def create_review(review: ReviewCreate, user=Depends(get_current_user)):
    existing_review = (
        supabase_client.table("reviews")
        .select("*")
        .eq("user_id", user["id"])
        .eq("product_id", review.product_id)
        .execute()
    )
    
    if existing_review.data:
        raise HTTPException(status_code=400, detail="You have already reviewed this product.")
    
    response = (
        supabase_client.table("reviews")
        .insert(
            {
                "user_id": user["id"],
                "product_id": review.product_id,
                "rating": review.rating,
                "review_text": review.review_text,
            }
        )
        .execute()
    )
    return {"message": "Review submitted successfully", "review": response.data}

@router.get("/{product_id}", response_model=List[ReviewResponse])
async def get_reviews(product_id: int):
    response = (
        supabase_client.table("reviews")
        .select("*, users(first_name, last_name)")  # Fetch first_name and last_name from users
        .eq("product_id", product_id)
        .execute()
    )

    if not response.data:
        return []

    # Combine first_name and last_name into full_name
    flattened_reviews = [
        {
            **review,
            "full_name": f"{review['users']['first_name']} {review['users']['last_name']}"
        }
        for review in response.data
    ]
    return flattened_reviews