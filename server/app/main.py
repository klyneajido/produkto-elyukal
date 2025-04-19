from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging
from app.routes import auth, fetch_products, reviews, fetch_stores, fetch_events, fetch_highlights, fetch_municipalities

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
# root
@app.get("/")
def read_root():
    return {"message":"running all goods boss!"}

# Proxy endpoint for Rasa
@app.post("/rasa/webhooks/rest/webhook")
async def proxy_rasa(request: Request):
    try:
        body = await request.body()
        logger.info(f"Received request body: {body}")
        if not body:
            raise HTTPException(status_code=400, detail="Request body is empty")
        data = await request.json()
        logger.info(f"Parsed JSON: {data}")
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "http://0.0.0.0:5055/webhooks/rest/webhook",
                json=data
            )
            logger.info(f"Rasa response: {response.json()}")
            return response.json()
    except ValueError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")
    except httpx.TimeoutException as e:
        logger.error(f"Timeout error: {str(e)}")
        raise HTTPException(status_code=504, detail="Rasa server timed out")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Test endpoint for Rasa
@app.get("/test-rasa")
async def test_rasa():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://0.0.0.0:5055")
            logger.info(f"Rasa test response: {response.text}")
            return {"status": "success", "response": response.text}
    except Exception as e:
        logger.error(f"Rasa test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reach Rasa: {str(e)}")

# routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(fetch_products.router, prefix="/products", tags=["Products"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
app.include_router(fetch_stores.router, prefix="/stores", tags=["Stores"])
app.include_router(fetch_events.router, prefix="/events", tags=["Events"])
app.include_router(fetch_highlights.router, prefix="/highlights", tags=["Highlights"])
app.include_router(fetch_municipalities.router, prefix="/municipalities", tags=["Municipalities"])