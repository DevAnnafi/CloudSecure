from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models import Account
from pydantic import BaseModel
from typing import Optional
from api.core.auth import get_current_user
from api.models.user import User

router = APIRouter()

class AccountCreate(BaseModel):
    cloud_provider: str
    account_id: str
    account_name: str
    profile: Optional[str] = None

@router.get("/accounts")
def get_accounts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Account).filter(Account.user_id == current_user.id).all()

@router.post("/accounts")
def create_account(payload: AccountCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    account = Account(
        user_id=current_user.id,
        cloud_provider=payload.cloud_provider,
        account_id=payload.account_id,
        account_name=payload.account_name,
        profile=payload.profile,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account

@router.delete("/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == current_user.id  
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"deleted": account_id}