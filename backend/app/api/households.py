from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Household)
def create_household(
    household: schemas.HouseholdCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.household_id:
        raise HTTPException(status_code=400, detail="User already belongs to a household")
    
    invite_code = str(uuid.uuid4())[:8].upper()
    db_household = models.Household(name=household.name, invite_code=invite_code)
    db.add(db_household)
    db.commit()
    db.refresh(db_household)
    
    current_user.household_id = db_household.id
    db.commit()
    
    return db_household

@router.post("/join/{invite_code}", response_model=schemas.Household)
def join_household(
    invite_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.household_id:
        raise HTTPException(status_code=400, detail="User already belongs to a household")
    
    db_household = db.query(models.Household).filter(models.Household.invite_code == invite_code).first()
    if not db_household:
        raise HTTPException(status_code=404, detail="Household not found with this invite code")
    
    current_user.household_id = db_household.id
    db.commit()
    db.refresh(db_household)
    
    return db_household

@router.get("/me", response_model=schemas.Household)
def get_my_household(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="User does not belong to a household")
    
    return current_user.household
