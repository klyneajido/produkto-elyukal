from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    first_name: str
    last_name: str

# Add this new schema
class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# Add this new schema
class EmailVerification(BaseModel):
    email: EmailStr
    code: str
