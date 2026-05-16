from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="User must belong to a household to create transactions")
    
    db_transaction = models.Transaction(
        **transaction.model_dump(),
        user_id=current_user.id,
        household_id=current_user.household_id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/", response_model=List[schemas.Transaction])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.household_id:
        return [] # 回傳空清單，不報錯
    
    # Query logic: 
    # 1. Transactions from the same household that are public
    # 2. Transactions from the same household that are private BUT belong to the current user
    transactions = db.query(models.Transaction).filter(
        models.Transaction.household_id == current_user.household_id
    ).filter(
        (models.Transaction.is_public == True) | (models.Transaction.user_id == current_user.id)
    ).all()
    
    return transactions

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if db_transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this transaction")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted"}
