from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str]

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str