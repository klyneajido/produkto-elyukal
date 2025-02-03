from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from pydantic import BaseModel
import supabase
import os
import bcrypt
import jwt
from datetime import datetime,timedelta

load_dotenv()

app = FastAPI()

SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_KEY=os.getenv("SUPABASE_KEY")
SECRET_KEY=os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

supabase_client =  supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

# pydantic models
class userRegister(BaseModel):
    email:str
    password:str
    first_name:str
    last_name:str

class userLogin(BaseModel):
    email:str
    password:str

#creating access tokens
def create_access_token(data:dict):
    to_encode =data.copy
    expire = datetime.utcnow() + timedata(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt

#verify tokens
def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token", headers={"WWW-Aunthenticate":"Bearer"},)

# Hashing
def hash_password(password:str):
    return bcrypt.hashpw(password.encode(),bcrypt.gensalt()).decode()

@app.post("/register")
def register_user(user: userRegister):
    hashed_password = hash_password(user.password)

    print(f"Registering user: {user.email}")  # Debugging line
    print(f"Hashed password: {hashed_password}")  # Debugging line

    response = supabase_client.table("users").insert({
        "email":user.email,
        "password_hash":hashed_password,
        "first_name":user.first_name,
        "last_name":user.last_name
    }).execute()

    if response.data is None or len(response.data) == 0:
        raise HTTPException(status_code=400, detail="User Already exists.")
    return{"message":"User Registered Successfully"}


@app.post("/login")
def login_user(user:userLogin):
    response = supabase_client.table("users").select("*").eq("email", user.email).execute()

    if not response[0]:
        raise HTTPException(status_code=400,detail="User not found")

    db_user = response[0][0]
    if not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
        raise HTTPException(status_code=400, detail="Wrong password")
    
    access_token = create_access_token(data={"sub":user.email})
    return{"message": "Login Successful", "access_token":access_token}

@app.post("/profile")
def get_user_profile(payload:dict=Depends(verify_token)):
    user_email = payload.get("sub")
    response = supabase_client.table("users").select("*").eq("email", user_email).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"profile": response.data[0]}