from fastapi import APIRouter, Depends, HTTPException
from app.db.database import supabase_client
from app.core.security import hash_password, create_access_token, verify_token
from app.schemas.user import UserRegister, UserLogin
from datetime import timedelta

router = APIRouter()

@router.post("/register")
async def register_user(user: UserRegister):
    existing_user = supabase_client.table("users").select("*").eq("email", user.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)
    supabase_client.table("users").insert({
        "email": user.email,
        "password_hash": hashed_password,
        "first_name": user.first_name,
        "last_name": user.last_name
    }).execute()

    return {"message": "User registered successfully"}

@router.post("/login")
async def login_user(user: UserLogin):
    response = supabase_client.table("users").select("*").eq("email", user.email).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="User not found")

    db_user = response.data[0]
    if not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile")
async def get_user_profile(current_user: dict = Depends(verify_token)):
    user_email = current_user.get("sub")
    response = supabase_client.table("users").select("email", "first_name", "last_name").eq("email", user_email).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {"profile": response.data[0]}
