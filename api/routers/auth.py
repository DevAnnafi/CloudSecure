import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.auth import hash_password, verify_password, create_access_token, get_current_user
from api.models.user import User
from api.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from api.services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset link"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists (security best practice)
        return {"message": "If that email exists, a reset link has been sent"}
    
    # Generate secure random token
    reset_token = secrets.token_urlsafe(32)
    
    # Token expires in 1 hour
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Save to database
    user.reset_token = reset_token
    user.reset_token_expires = expires
    db.commit()
    
    # Print reset link to Railway logs (for testing - replace with email later)
    reset_link = f"https://cloud-secure-2kuhbpxtn-devannafis-projects.vercel.app/reset-password?token={reset_token}"
    print(f"\n{'='*80}")
    print(f"PASSWORD RESET LINK FOR {user.email}:")
    print(f"{reset_link}")
    print(f"{'='*80}\n")
        
    send_password_reset_email(user.email, reset_link)
    
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using a valid token"""
    # Find user with this token
    user = db.query(User).filter(User.reset_token == request.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token expired
    if user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Validate password length
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Hash new password (using your existing hash_password function)
    hashed_password = hash_password(request.new_password)
    
    # Update password and clear reset token
    user.hashed_password = hashed_password
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password successfully reset"}


@router.get("/verify-reset-token/{token}")
def verify_reset_token(token: str, db: Session = Depends(get_db)):
    """Verify if a reset token is valid (used by frontend)"""
    user = db.query(User).filter(User.reset_token == token).first()
    
    if not user or user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    return {"valid": True, "email": user.email}