from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_user
from app.dto import to_exercise_detail, to_exercise_summary
from app.models import Exercise
from app.schemas import ExerciseDetail, ExerciseListResponse

router = APIRouter(prefix="/api/exercises", tags=["exercises"], dependencies=[Depends(require_user)])


@router.get("", response_model=ExerciseListResponse)
def search_exercises(
    q: str | None = None,
    body_part: str | None = None,
    equipment: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
) -> ExerciseListResponse:
    """Búsqueda paginada de ejercicios del dataset (1324 registros): usada
    por el combobox del entrenador y por la biblioteca del alumno."""
    query = db.query(Exercise)
    if q and q.strip():
        query = query.filter(Exercise.search_name.contains(q.strip().lower()))
    if body_part:
        query = query.filter(Exercise.body_part == body_part)
    if equipment:
        query = query.filter(Exercise.equipment == equipment)

    total = query.count()
    items = query.order_by(Exercise.name.asc()).offset((page - 1) * page_size).limit(page_size).all()

    return ExerciseListResponse(
        items=[to_exercise_summary(e) for e in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{exercise_id}", response_model=ExerciseDetail)
def get_exercise(exercise_id: str, db: Session = Depends(get_db)) -> ExerciseDetail:
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ejercicio no encontrado.")
    return to_exercise_detail(exercise)
