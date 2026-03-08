from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.auth import hash_password, verify_password, create_access_token, get_current_user
from api.models.user import User
from api.schemas.auth import UserRegister, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is not None:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, full_name=payload.full_name, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    matched_user = db.query(User).filter(User.email == payload.email).first()
    if matched_user is None:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(payload.password, matched_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token({"sub": matched_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "full_name" in payload:
        current_user.full_name = payload["full_name"]
    if "email" in payload:
        current_user.email = payload["email"]
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def update_password(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.get("current_password", ""), current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    current_user.hashed_password = hash_password(payload.get("new_password", ""))
    db.commit()
    return {"message": "Password updated"}

@router.put("/me/avatar")
def update_avatar(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.avatar = payload.get("avatar")
    db.commit()
    return {"message": "Avatar updated"}
