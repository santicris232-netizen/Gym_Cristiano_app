from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RoleEnum, User
from app.security import SESSION_COOKIE_NAME, verify_session_token


def get_current_user(
    session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User | None:
    if not session:
        return None
    payload = verify_session_token(session)
    if not payload:
        return None
    return db.get(User, payload["user_id"])


def require_user(user: User | None = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No has iniciado sesión.")
    return user


def require_role(role: RoleEnum):
    def _dependency(user: User = Depends(require_user)) -> User:
        if user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permiso para acceder a este recurso.",
            )
        return user

    return _dependency


require_trainer = require_role(RoleEnum.TRAINER)
require_alumno = require_role(RoleEnum.USER)
