#auth/auth_handler.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from core.security import verify_token
from db.database import supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # First try to verify as a Supabase token
        try:
            # Verify with Supabase
            response = supabase_client.auth.get_user(token)
            if response and response.user:
                user_email = response.user.email
                
                # Check if user exists in our database
                user_response = supabase_client.table("users").select("id").eq("email", user_email).execute()
                
                # If user doesn't exist yet, create them
                if not user_response.data or len(user_response.data) == 0:
                    # Extract name from user metadata
                    first_name = ""
                    last_name = ""
                    if response.user.user_metadata and "full_name" in response.user.user_metadata:
                        name_parts = response.user.user_metadata["full_name"].split()
                        first_name = name_parts[0] if name_parts else ""
                        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                    
                    # Create user in our database
                    insert_data = {
                        "email": user_email,
                        "first_name": first_name,
                        "last_name": last_name,
                        # Add a placeholder password hash for users created via OAuth
                        "password_hash": "OAUTH_USER"
                    }
                    
                    insert_response = supabase_client.table("users").insert(insert_data).execute()
                    
                    if insert_response.data and len(insert_response.data) > 0:
                        return {"id": insert_response.data[0]["id"]}
                    else:
                        print(f"Failed to create user: {insert_response.error}")
                        raise credentials_exception
                else:
                    return {"id": user_response.data[0]["id"]}
        
        except Exception as supabase_error:
            print(f"Supabase auth error: {supabase_error}")
            # If Supabase verification fails, try JWT verification
            try:
                payload = verify_token(token)
                if payload is not None:
                    email = payload.get("sub")
                    if email:
                        # Fetch user from database using email
                        user_response = supabase_client.table("users").select("id").eq("email", email).execute()
                        if user_response.data and len(user_response.data) > 0:
                            return {"id": user_response.data[0]["id"]}
                
                raise credentials_exception
            except Exception as jwt_error:
                print(f"JWT auth error: {jwt_error}")
                raise credentials_exception
    
    except Exception as e:
        print(f"Authentication error: {e}")
        raise credentials_exception
