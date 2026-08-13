from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.dto import get_weekly_plan
from app.models import User
from app.schemas import PlanDayOut

router = APIRouter(prefix="/api/plan", tags=["plan"])


@router.get("/me", response_model=list[PlanDayOut])
def get_my_plan(user: User = Depends(require_user), db: Session = Depends(get_db)) -> list[PlanDayOut]:
    return get_weekly_plan(db, user.id)
