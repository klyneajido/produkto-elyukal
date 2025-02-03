import asyncpg
import os
from fastapi import FastAPI

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:123@localhost/produkto_elyukal")

async def test_db_connection():
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to PostgreSQL successfully!")
        await conn.close()
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")

@app.on_event("startup")
async def startup_event():
    await test_db_connection()  # Run the DB test on startup
