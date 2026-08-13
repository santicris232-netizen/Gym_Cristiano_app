from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.models import Exercise, SetLog, User, WorkoutSession
from app.schemas import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionDetailOut,
    SessionWithSetsOut,
    SetLogSaved,
    UpsertSetRequest,
)
from app.utils import to_canonical_kg, today_date_key, today_day_of_week

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=CreateSessionResponse)
def create_or_get_today_session(
    payload: CreateSessionRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
) -> CreateSessionResponse:
    """Obtiene (o crea) la sesión de entrenamiento del usuario para hoy."""
    date_key = today_date_key()
    day_of_week = payload.day_of_week if payload.day_of_week is not None else today_day_of_week()

    session = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user.id, WorkoutSession.date_key == date_key)
        .first()
    )
    if not session:
        session = WorkoutSession(user_id=user.id, day_of_week=day_of_week, date_key=date_key)
        db.add(session)
        try:
            db.commit()
        except IntegrityError:
            # Doble click / doble request casi simultánea: otra ya ganó
            # la carrera por la unique constraint (user_id, date_key).
            db.rollback()
            session = (
                db.query(WorkoutSession)
                .filter(WorkoutSession.user_id == user.id, WorkoutSession.date_key == date_key)
                .first()
            )
        else:
            db.refresh(session)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear la sesión de hoy.",
        )

    return CreateSessionResponse(session_id=session.id, date_key=session.date_key, day_of_week=session.day_of_week)


def _get_own_session_or_404(db: Session, user: User, session_id: str) -> WorkoutSession:
    session = db.get(WorkoutSession, session_id)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sesión no encontrada.")
    return session


@router.get("/{session_id}", response_model=SessionWithSetsOut)
def get_session(
    session_id: str,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
) -> SessionWithSetsOut:
    session = _get_own_session_or_404(db, user, session_id)
    return SessionWithSetsOut(
        session=SessionDetailOut(
            id=session.id,
            date_key=session.date_key,
            day_of_week=session.day_of_week,
            completed=session.completed,
        ),
        set_logs=[
            SetLogSaved(
                id=sl.id,
                exercise_id=sl.exercise_id,
                set_number=sl.set_number,
                weight_kg=sl.weight_kg,
                reps=sl.reps,
            )
            for sl in session.set_logs
        ],
    )


@router.post("/{session_id}/sets", response_model=SetLogSaved)
def upsert_set(
    session_id: str,
    payload: UpsertSetRequest,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
) -> SetLogSaved:
    """Registra (o actualiza) el peso y las repeticiones de una serie
    concreta de un ejercicio dentro de una sesión. El peso llega en la
    unidad preferida del usuario y se convierte a kg (canónico) antes de
    guardarse."""
    session = _get_own_session_or_404(db, user, session_id)

    exercise = db.get(Exercise, payload.exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ejercicio no encontrado.")

    weight_kg = to_canonical_kg(payload.weight, user.weight_unit)

    set_log = (
        db.query(SetLog)
        .filter(
            SetLog.session_id == session_id,
            SetLog.exercise_id == payload.exercise_id,
            SetLog.set_number == payload.set_number,
        )
        .first()
    )
    if set_log:
        set_log.weight_kg = weight_kg
        set_log.reps = payload.reps
    else:
        set_log = SetLog(
            session_id=session_id,
            exercise_id=payload.exercise_id,
            set_number=payload.set_number,
            weight_kg=weight_kg,
            reps=payload.reps,
        )
        db.add(set_log)

    session.completed = True
    db.commit()
    db.refresh(set_log)

    return SetLogSaved(
        id=set_log.id,
        exercise_id=set_log.exercise_id,
        set_number=set_log.set_number,
        weight_kg=set_log.weight_kg,
        reps=set_log.reps,
    )
