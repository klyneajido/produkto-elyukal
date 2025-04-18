# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, fetch_products, reviews, fetch_stores, fetch_events, fetch_highlights, fetch_municipalities

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
app.include_router(fetch_stores.router, prefix="/stores", tags=["Stores"])
app.include_router(fetch_events.router, prefix="/events", tags=["Events"])
app.include_router(fetch_highlights.router, prefix="/highlights", tags=["Highlights"])
app.include_router(fetch_municipalities.router, prefix="/municipalities", tags=["Municipalities"])