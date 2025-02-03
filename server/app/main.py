from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth
import asyncpg
import os
import logging

# Set up logging for detailed error handling
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the path of Firebase credentials
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FIREBASE_CREDENTIALS = os.path.join(BASE_DIR, "firebase_credentials.json")

# Initialize the Firebase Admin SDK
cred = credentials.Certificate(FIREBASE_CREDENTIALS)
firebase_admin.initialize_app(cred)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://a748-119-92-140-8.ngrok-free.app"],  # Change this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to PostgreSQL with connection pooling
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:123@localhost/produkto_elyukal")
db_pool = None  # Define pool variable globally

async def init_db():
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(DATABASE_URL)
        logger.info("PostgreSQL database connection established successfully.")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.on_event("startup")
async def startup():
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()
        logger.info("Database connection pool closed.")

# Dependency to get a database connection
async def get_db():
    async with db_pool.acquire() as conn:
        yield conn


class User(BaseModel):
    firebase_uid: str
    email: str
    first_name: str
    last_name: str


@app.post("/register/")
async def register_user(user: User, db: asyncpg.Connection = Depends(get_db)):
    try:
        # Check if user exists
        logger.info(f"Checking if user with firebase_uid {user.firebase_uid} exists...")
        existing_user = await db.fetchrow("SELECT * FROM users WHERE firebase_uid = $1", user.firebase_uid)
        if existing_user:
            logger.warning(f"User with firebase_uid {user.firebase_uid} already exists.")
            raise HTTPException(status_code=400, detail="User already exists")

        # Insert new user
        logger.info(f"Inserting new user with firebase_uid {user.firebase_uid}...")
        await db.execute(
            "INSERT INTO users (firebase_uid, email, first_name, last_name) VALUES ($1, $2, $3, $4)",
            user.firebase_uid, user.email, user.first_name, user.last_name
        )
        logger.info(f"User with firebase_uid {user.firebase_uid} registered successfully.")
        return {"message": "User registered successfully!"}

    except asyncpg.exceptions.UniqueViolationError as e:
        logger.error(f"Unique constraint violation: {str(e)}")
        raise HTTPException(status_code=400, detail="User already exists")
    except asyncpg.exceptions.PostgresError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during user registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/verify/")
async def verify_token(token: str):
    try:
        # Verify Firebase token
        logger.info("Verifying Firebase token...")
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token['uid']
        logger.info(f"Token is valid. Firebase UID: {firebase_uid}")
        return {"uid": firebase_uid, "message": "Token is valid"}

    except auth.InvalidIdTokenError as e:
        logger.error(f"Invalid Firebase token: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid Token")
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
