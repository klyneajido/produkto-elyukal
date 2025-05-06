from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.cleanup import cleanup_unverified_users
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up scheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(cleanup_unverified_users, 'interval', hours=24)
scheduler.start()

# Import and include routers
from routes import auth
from routes import fetch_products as products
from routes import fetch_stores as stores
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(stores.router, prefix="/stores", tags=["stores"])

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
