from pydantic import BaseModel

class ReviewCreate(BaseModel):
    product_id: int
    rating: float
    review_text: str

class ReviewResponse(BaseModel):
    created_at: str
    product_id: int
    rating: float
    review_text: str
    user_id: str
    full_name: str  # Replace username with full_name

    class Config:
        from_attributes = True