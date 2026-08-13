from __future__ import annotations

import json

from sqlalchemy.orm import Session, joinedload

from app.models import Exercise, PlanEntry
from app.schemas import ExerciseDetail, ExerciseSummary, PlanDayOut, PlanEntryOut
from app.utils import exercise_media_url


def to_exercise_summary(exercise: Exercise) -> ExerciseSummary:
    return ExerciseSummary(
        id=exercise.id,
        name=exercise.name,
        image=exercise_media_url(exercise.image),
        body_part=exercise.body_part,
        equipment=exercise.equipment,
        target=exercise.target,
    )


def to_exercise_detail(exercise: Exercise) -> ExerciseDetail:
    summary = to_exercise_summary(exercise)
    return ExerciseDetail(
        **summary.model_dump(),
        category=exercise.category,
        muscle_group=exercise.muscle_group,
        secondary_muscles=json.loads(exercise.secondary_muscles),
        instructions_es=exercise.instructions_es,
        instruction_steps_es=json.loads(exercise.instruction_steps_es),
        gif_url=exercise_media_url(exercise.gif_url),
        attribution=exercise.attribution,
    )


def get_weekly_plan(db: Session, user_id: str) -> list[PlanDayOut]:
    """Plan semanal completo (7 días, 0=Lunes..6=Domingo) de un usuario."""
    entries = (
        db.query(PlanEntry)
        .options(joinedload(PlanEntry.exercise))
        .filter(PlanEntry.user_id == user_id)
        .order_by(PlanEntry.day_of_week.asc(), PlanEntry.position.asc())
        .all()
    )

    days = [PlanDayOut(day_of_week=i, entries=[]) for i in range(7)]
    for entry in entries:
        days[entry.day_of_week].entries.append(
            PlanEntryOut(
                id=entry.id,
                position=entry.position,
                sets=entry.sets,
                reps=entry.reps,
                notes=entry.notes,
                exercise=to_exercise_summary(entry.exercise),
            )
        )
    return days
