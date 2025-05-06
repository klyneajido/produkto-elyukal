# auth/auth.py
from fastapi import APIRouter, Depends, HTTPException
from db.database import supabase_client
from core.security import hash_password, create_access_token, verify_token
from schemas.user import UserRegister, UserLogin, UserProfileUpdate, PasswordUpdate, EmailVerification
from datetime import datetime, timedelta
import bcrypt
from core.config import settings
import random
import smtplib
from email.mime.text import MIMEText
import logging
from pydantic import EmailStr

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification_email(email: str, code: str):
    sender_email = settings.SENDER_EMAIL
    sender_password = settings.SENDER_PASSWORD
    
    message = MIMEText(f"Your verification code is: {code}")
    message["Subject"] = "Produkto Elyukal - Email Verification Code"
    message["From"] = sender_email
    message["To"] = email
    
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            logger.info(f"Attempting to login to SMTP server with email: {sender_email}")
            server.login(sender_email, sender_password)
            logger.info(f"Sending verification email to: {email}")
            server.sendmail(sender_email, email, message.as_string())
            logger.info("Verification email sent successfully")
    except smtplib.SMTPAuthenticationError as auth_error:
        logger.error(f"SMTP Authentication Error: {str(auth_error)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to authenticate with email server. Please check email credentials."
        )
    except Exception as e:
        logger.error(f"Failed to send verification email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")

@router.post("/register")
async def register_user(user: UserRegister):
    try:
        # Check if user already exists
        existing_user = supabase_client.table("users").select("*").eq("email", user.email).execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            # Check if the existing user is verified
            if existing_user.data[0].get("is_verified", False):
                # User exists and is verified - cannot register again
                raise HTTPException(status_code=400, detail="User already exists")
            else:
                # User exists but is not verified - allow re-registration
                # Update the user's information
                supabase_client.table("users").update({
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "password_hash": hash_password(user.password)
                }).eq("email", user.email).execute()
                
                # Delete any existing verification codes
                supabase_client.table("email_verification").delete().eq("email", user.email).execute()
        else:
            # Insert new user with is_verified=False
            user_response = supabase_client.table("users").insert({
                "email": user.email,
                "password_hash": hash_password(user.password),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_verified": False
            }).execute()

        # Generate new verification code
        verification_code = generate_verification_code()
        expires_at = datetime.utcnow() + timedelta(minutes=30)
        
        # Insert verification code
        verification_response = supabase_client.table("email_verification").insert({
            "email": user.email,
            "code": verification_code,
            "expires_at": expires_at.isoformat()
        }).execute()

        # Send verification email
        send_verification_email(user.email, verification_code)

        return {"message": "User registered successfully. Please check your email for verification code."}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-email")
async def verify_email(verification: EmailVerification):
    try:
        # Check verification code
        record = supabase_client.table("email_verification").select("*").eq("email", verification.email).eq("code", verification.code).execute()
        
        if not record.data or len(record.data) == 0:
            raise HTTPException(status_code=400, detail="Invalid verification code")
            
        if datetime.fromisoformat(record.data[0]["expires_at"]) < datetime.utcnow():
            # Generate new code if expired
            verification_code = generate_verification_code()
            expires_at = datetime.utcnow() + timedelta(minutes=30)
            
            # Update verification code
            supabase_client.table("email_verification").update({
                "code": verification_code,
                "expires_at": expires_at.isoformat()
            }).eq("email", verification.email).execute()
            
            # Send new verification email
            send_verification_email(verification.email, verification_code)
            
            raise HTTPException(status_code=400, detail="Verification code expired. A new code has been sent to your email.")
        
        # Update user verification status
        user_response = supabase_client.table("users").update({
            "is_verified": True
        }).eq("email", verification.email).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Delete verification record
        supabase_client.table("email_verification").delete().eq("email", verification.email).execute()

        # Create access token for immediate login
        access_token = create_access_token(
            data={"sub": verification.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {
            "message": "Email verified successfully",
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_user(user: UserLogin):
    try:
        # Check if user exists
        response = supabase_client.table("users").select("*").eq("email", user.email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=400, detail="User not found")

        db_user = response.data[0]
        
        # Verify password
        if not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
            raise HTTPException(status_code=400, detail="Incorrect password")
        
        # Check verification status
        if not db_user.get("is_verified", False):
            # Generate a new verification code
            verification_code = generate_verification_code()
            expires_at = datetime.utcnow() + timedelta(minutes=30)
            
            # Upsert verification code
            supabase_client.table("email_verification").upsert({
                "email": user.email,
                "code": verification_code,
                "expires_at": expires_at.isoformat()
            }).execute()
            
            # Send verification email
            send_verification_email(user.email, verification_code)
            
            # Return a specific status code and message for unverified accounts
            raise HTTPException(
                status_code=403,
                detail="Email not verified. A new verification code has been sent to your email."
            )

        # If user is verified, proceed with login
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile")
async def get_user_profile(current_user: dict = Depends(verify_token)):
    try:
        user_email = current_user.get("sub")
        response = supabase_client.table("users").select("email", "first_name", "last_name", "is_verified").eq("email", user_email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"profile": response.data[0]}
    except Exception as e:
        logger.error(f"Profile fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/profile/update")
async def update_user_profile(
    profile: UserProfileUpdate,
    current_user: dict = Depends(verify_token)
):
    try:
        user_email = current_user.get("sub")
        update_data = {
            "first_name": profile.first_name.strip(),
            "last_name": profile.last_name.strip(),
        }

        response = supabase_client.table("users").update(update_data).eq("email", user_email).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "Profile updated successfully"}
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/password/update")
async def update_password(
    password_update: PasswordUpdate,
    current_user: dict = Depends(verify_token)
):
    try:
        user_email = current_user.get("sub")
        response = supabase_client.table("users").select("*").eq("email", user_email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user = response.data[0]
        
        if not bcrypt.checkpw(password_update.current_password.encode(), user["password_hash"].encode()):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        new_password_hash = hash_password(password_update.new_password)
        
        update_response = supabase_client.table("users").update({
            "password_hash": new_password_hash
        }).eq("email", user_email).execute()

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update password")

        return {"message": "Password updated successfully"}
    except Exception as e:
        logger.error(f"Password update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resend-verification")
async def resend_verification(email: EmailStr):
    try:
        # Check if user exists
        user_response = supabase_client.table("users").select("*").eq("email", email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Check if user is already verified
        if user_response.data[0].get("is_verified", False):
            return {"message": "User is already verified"}
            
        # Generate new verification code
        verification_code = generate_verification_code()
        expires_at = datetime.utcnow() + timedelta(minutes=30)
        
        # Upsert verification code
        supabase_client.table("email_verification").upsert({
            "email": email,
            "code": verification_code,
            "expires_at": expires_at.isoformat()
        }).execute()
        
        # Send verification email
        send_verification_email(email, verification_code)
        
        return {"message": "Verification code sent successfully"}
    except Exception as e:
        logger.error(f"Resend verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
