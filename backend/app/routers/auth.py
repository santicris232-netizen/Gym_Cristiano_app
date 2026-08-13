from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import RoleEnum, User
from app.schemas import LoginRequest, RegisterRequest, UserPublic
from app.security import (
    clear_session_cookie,
    create_session_token,
    hash_password,
    set_session_cookie,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=UserPublic)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> User:
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas.")

    token = create_session_token(user.id, user.role.value, user.name)
    set_session_cookie(response, token)
    return user


# Autoregistro abierto: cualquiera puede crear su cuenta de alumno (rol
# USER automático). El entrenador también puede dar de alta alumnos
# manualmente desde POST /api/users.
@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> User:
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe una cuenta con ese email.")

    user = User(
        email=email,
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        role=RoleEnum.USER,
        weight_unit=payload.weight_unit,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_session_token(user.id, user.role.value, user.name)
    set_session_cookie(response, token)
    return user


@router.post("/logout")
def logout(response: Response) -> dict[str, bool]:
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserPublic)
def me(user: User | None = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No has iniciado sesión.")
    return user
