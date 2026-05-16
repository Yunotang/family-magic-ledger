from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

# Base Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class HouseholdBase(BaseModel):
    name: str

class TransactionBase(BaseModel):
    amount: Decimal
    category: str
    is_public: bool = True
    description: Optional[str] = None
    trans_date: datetime

# Create Schemas
class UserCreate(UserBase):
    password: str

class HouseholdCreate(HouseholdBase):
    pass

class TransactionCreate(TransactionBase):
    pass

# Response Schemas
class Transaction(TransactionBase):
    id: int
    user_id: int
    household_id: int
    image_url: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class User(UserBase):
    id: int
    household_id: Optional[int] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class Household(HouseholdBase):
    id: int
    invite_code: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
