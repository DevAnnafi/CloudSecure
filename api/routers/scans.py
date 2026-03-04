import sys 
import os 
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import Session 
from api.core.database import get_db
from api.models import Scan, Account, Finding
from api.schemas.scan import ScanCreate, ScanResponse
from typing import List

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

router = APIRouter(prefix="/scans", tags=["scans"])
