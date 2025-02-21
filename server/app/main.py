# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, fetch_products
from app.routes import auth, fetch_products, reviews

app = FastAPI()

#Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#root
@app.get("/")
def read_root():
    return {"message":"running all goods boss!"}

#routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(fetch_products.router, prefix="/products", tags=["Products"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])