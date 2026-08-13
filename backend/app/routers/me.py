from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.models import User
from app.schemas import UserPublic, WeightUnitUpdateRequest

router = APIRouter(prefix="/api/me", tags=["me"])


@router.patch("/weight-unit", response_model=UserPublic)
def update_weight_unit(
    payload: WeightUnitUpdateRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
) -> User:
    user.weight_unit = payload.weight_unit
    db.commit()
    db.refresh(user)
    return user
