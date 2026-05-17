from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import models
from .auth import get_current_user

router = APIRouter()

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.household_id:
        return {"total_expenses": 0, "categories": {}}
    
    # Simple summary logic
    transactions = db.query(models.Transaction).filter(
        models.Transaction.household_id == current_user.household_id
    ).filter(
        (models.Transaction.is_public == True) | (models.Transaction.user_id == current_user.id)
    ).all()
    
    total_expenses = sum([t.amount for t in transactions if t.amount < 0])
    total_income = sum([t.amount for t in transactions if t.amount > 0])
    
    # Group by category
    category_summary = {}
    for t in transactions:
        if t.amount < 0:
            category_summary[t.category] = category_summary.get(t.category, 0) + float(abs(t.amount))
            
    return {
        "total_expenses": float(abs(total_expenses)),
        "total_income": float(total_income),
        "balance": float(total_income + total_expenses),
        "categories": category_summary
    }

@router.get("/analysis")
async def get_ai_analysis(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    summary = get_summary(db, current_user)
    if not summary["categories"]:
        return {"analysis": "目前還沒有足夠的資料可以進行魔法分析，請先多記幾筆帳吧！"}
    
    # 調用 AI 服務生成報告
    from ..services import ai_service
    report = await ai_service.analyze_finances_with_ai(summary)
    return {"analysis": report}
