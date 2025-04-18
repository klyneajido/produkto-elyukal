# auth/auth.py
from fastapi import APIRouter, Depends, HTTPException
from app.db.database import supabase_client
from app.core.security import hash_password, create_access_token, verify_token
from app.schemas.user import UserRegister, UserLogin, UserProfileUpdate, PasswordUpdate
from datetime import datetime, timedelta
import bcrypt
from app.core.config import settings

router = APIRouter()

@router.post("/register")
async def register_user(user: UserRegister):
    try:
        # Check if user already exists
        existing_user = supabase_client.table("users").select("*").eq("email", user.email).execute()
        if existing_user.data and len(existing_user.data) > 0:
            raise HTTPException(status_code=400, detail="User already exists")

        hashed_password = hash_password(user.password)
        
        response = supabase_client.table("users").insert({
            "email": user.email,
            "password_hash": hashed_password,
            "first_name": user.first_name,
            "last_name": user.last_name
        }).execute()

        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_user(user: UserLogin):
    try:
        response = supabase_client.table("users").select("*").eq("email", user.email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=400, detail="User not found")

        db_user = response.data[0]
        if not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
            raise HTTPException(status_code=400, detail="Incorrect password")
        
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        # Add more detailed logging
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile")
async def get_user_profile(current_user: dict = Depends(verify_token)):
    try:
        user_email = current_user.get("sub")
        response = supabase_client.table("users").select("email", "first_name", "last_name").eq("email", user_email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"profile": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/profile/update")
async def update_user_profile(
    profile: UserProfileUpdate,
    current_user: dict = Depends(verify_token)
):
    try:
        user_email = current_user.get("sub")
        # Update user data in Supabase
        update_data = {
            "first_name": profile.first_name.strip(),  # Trim whitespace
            "last_name": profile.last_name.strip(),   # Trim whitespace
        }

        response = supabase_client.table("users").update(update_data).eq("email", user_email).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/password/update")
async def update_password(
    password_update: PasswordUpdate,
    current_user: dict = Depends(verify_token)
):
    try:
        user_email = current_user.get("sub")
        # Get user from database
        response = supabase_client.table("users").select("*").eq("email", user_email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user = response.data[0]
        
        # Verify current password
        if not bcrypt.checkpw(password_update.current_password.encode(), user["password_hash"].encode()):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Hash new password
        new_password_hash = hash_password(password_update.new_password)
        
        # Update password in database
        update_response = supabase_client.table("users").update({
            "password_hash": new_password_hash
        }).eq("email", user_email).execute()

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update password")

        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
