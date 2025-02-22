from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import verify_token
from app.db.database import supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Verify JWT token and get payload
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Token missing 'sub' claim")

        # Fetch user from Supabase using email
        user_response = supabase_client.table("users").select("id").eq("email", email).execute()
        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=401, detail="User not found in database")

        user = user_response.data[0]
        return {"id": user["id"]}  # Return {"id": "<uuid>"}
    except Exception as e:
        raise credentials_exception from e