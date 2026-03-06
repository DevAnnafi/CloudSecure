from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.auth import hash_password, verify_password, create_access_token, get_current_user
from api.models.user import User
from api.schemas.auth import UserRegister, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == payload.email
    ).first()
    if user is not None:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    matched_user = db.query(User).filter(
        User.email == payload.email
    ).first()
    if matched_user is None:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(payload.password, matched_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token({"sub": matched_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
