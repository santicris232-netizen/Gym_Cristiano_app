from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import require_trainer
from app.dto import get_weekly_plan
from app.models import Exercise, PlanEntry, RoleEnum, SetLog, User, WorkoutSession
from app.schemas import (
    CreateUserRequest,
    PlanDayOut,
    PlanDayUpdateRequest,
    ProgressPointOut,
    ProgressSetPoint,
    SessionSummaryOut,
    SetLogOut,
    UserPublic,
    UserSummary,
)
from app.security import hash_password

router = APIRouter(prefix="/api/users", tags=["users"], dependencies=[Depends(require_trainer)])


def _get_alumno_or_404(db: Session, user_id: str) -> User:
    user = db.get(User, user_id)
    if not user or user.role != RoleEnum.USER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alumno no encontrado.")
    return user


@router.get("", response_model=list[UserSummary])
def list_users(db: Session = Depends(get_db)) -> list[UserSummary]:
    """Lista de alumnos del entrenador, con la fecha de su último entrenamiento."""
    alumnos = db.query(User).filter(User.role == RoleEnum.USER).order_by(User.name.asc()).all()

    result: list[UserSummary] = []
    for alumno in alumnos:
        last_session = (
            db.query(WorkoutSession)
            .filter(WorkoutSession.user_id == alumno.id)
            .order_by(WorkoutSession.date.desc())
            .first()
        )
        result.append(
            UserSummary(
                id=alumno.id,
                name=alumno.name,
                email=alumno.email,
                created_at=alumno.created_at,
                last_trained_at=last_session.date if last_session else None,
            )
        )
    return result


@router.post("", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(payload: CreateUserRequest, db: Session = Depends(get_db)) -> User:
    """Alta manual de un alumno por el entrenador."""
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
    return user


@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: str, db: Session = Depends(get_db)) -> User:
    return _get_alumno_or_404(db, user_id)


@router.get("/{user_id}/plan", response_model=list[PlanDayOut])
def get_user_plan(user_id: str, db: Session = Depends(get_db)) -> list[PlanDayOut]:
    _get_alumno_or_404(db, user_id)
    return get_weekly_plan(db, user_id)


@router.put("/{user_id}/plan/{day_of_week}", response_model=PlanDayOut)
def update_plan_day(
    user_id: str,
    day_of_week: int,
    payload: PlanDayUpdateRequest,
    db: Session = Depends(get_db),
) -> PlanDayOut:
    """Reemplaza por completo las entradas de plan de un alumno para un
    día concreto de la semana (0=Lunes..6=Domingo)."""
    if not (0 <= day_of_week <= 6):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Día de la semana inválido.")
    _get_alumno_or_404(db, user_id)

    exercise_ids = [entry.exercise_id for entry in payload.entries]
    # Antes esto rompía con un 500 (violación de la unique constraint
    # user_id+day_of_week+exercise_id); ahora lo validamos a mano.
    if len(exercise_ids) != len(set(exercise_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hay ejercicios repetidos en el mismo día.",
        )

    if exercise_ids:
        found_ids = {row[0] for row in db.query(Exercise.id).filter(Exercise.id.in_(exercise_ids)).all()}
        missing = set(exercise_ids) - found_ids
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ejercicio(s) inexistente(s): {', '.join(sorted(missing))}.",
            )

    db.query(PlanEntry).filter(
        PlanEntry.user_id == user_id, PlanEntry.day_of_week == day_of_week
    ).delete(synchronize_session=False)

    for i, entry in enumerate(payload.entries):
        db.add(
            PlanEntry(
                user_id=user_id,
                day_of_week=day_of_week,
                exercise_id=entry.exercise_id,
                position=entry.position if entry.position is not None else i,
                sets=entry.sets or 3,
                reps=entry.reps or 10,
                notes=(entry.notes or "").strip() or None,
            )
        )
    db.commit()

    days = get_weekly_plan(db, user_id)
    return days[day_of_week]


@router.get("/{user_id}/sessions", response_model=list[SessionSummaryOut])
def get_user_sessions(user_id: str, db: Session = Depends(get_db)) -> list[SessionSummaryOut]:
    """Historial de sesiones: qué días entrenó el alumno y con qué peso/reps
    en cada serie de cada ejercicio."""
    _get_alumno_or_404(db, user_id)

    sessions = (
        db.query(WorkoutSession)
        .options(joinedload(WorkoutSession.set_logs).joinedload(SetLog.exercise))
        .filter(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.date.desc())
        .all()
    )

    result: list[SessionSummaryOut] = []
    for session in sessions:
        set_logs = sorted(session.set_logs, key=lambda sl: (sl.exercise_id, sl.set_number))
        result.append(
            SessionSummaryOut(
                id=session.id,
                date_key=session.date_key,
                day_of_week=session.day_of_week,
                completed=session.completed,
                set_logs=[
                    SetLogOut(
                        id=sl.id,
                        exercise_id=sl.exercise_id,
                        exercise_name=sl.exercise.name,
                        set_number=sl.set_number,
                        weight_kg=sl.weight_kg,
                        reps=sl.reps,
                    )
                    for sl in set_logs
                ],
            )
        )
    return result


@router.get("/{user_id}/progress/{exercise_id}", response_model=list[ProgressPointOut])
def get_progress(user_id: str, exercise_id: str, db: Session = Depends(get_db)) -> list[ProgressPointOut]:
    """Serie temporal del peso usado por el alumno en un ejercicio, una
    entrada por sesión en la que lo entrenó, ordenada por fecha. No se
    limita a los ejercicios del plan actual: cualquier ejercicio con
    historial aparece, aunque ya no esté asignado."""
    _get_alumno_or_404(db, user_id)

    set_logs = (
        db.query(SetLog)
        .join(WorkoutSession, SetLog.session_id == WorkoutSession.id)
        .options(joinedload(SetLog.session))
        .filter(SetLog.exercise_id == exercise_id, WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.date.asc())
        .all()
    )

    by_session: dict[str, ProgressPointOut] = {}
    for sl in set_logs:
        point = by_session.get(sl.session_id)
        if point is None:
            point = ProgressPointOut(
                session_id=sl.session_id,
                date=sl.session.date,
                date_key=sl.session.date_key,
                max_weight_kg=0.0,
                sets=[],
            )
            by_session[sl.session_id] = point
        point.sets.append(ProgressSetPoint(set_number=sl.set_number, weight_kg=sl.weight_kg, reps=sl.reps))
        point.max_weight_kg = max(point.max_weight_kg, sl.weight_kg)

    return sorted(by_session.values(), key=lambda p: p.date)
