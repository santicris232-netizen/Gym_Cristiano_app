"""Script de seed: importa los 1324 ejercicios del dataset y crea
cuentas demo (entrenador + 2 alumnos) con un plan semanal y, para
alumno1, varias semanas de historial de entrenamiento.

Uso:
    cd backend
    source .venv/bin/activate
    python seed.py
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Exercise, PlanEntry, RoleEnum, SetLog, User, WeightUnitEnum, WorkoutSession
from app.security import hash_password
from app.utils import today_date_key

DATA_PATH = Path(__file__).parent / "data" / "exercises.seed.json"


def seed_exercises(db: Session) -> None:
    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    print(f"Importando {len(raw)} ejercicios...")

    existing_ids = {row[0] for row in db.query(Exercise.id).all()}
    created = 0
    for item in raw:
        if item["id"] in existing_ids:
            continue
        db.add(
            Exercise(
                id=item["id"],
                name=item["name"],
                search_name=item["name"].lower(),
                category=item["category"],
                body_part=item["body_part"],
                equipment=item["equipment"],
                muscle_group=item["muscle_group"],
                target=item["target"],
                secondary_muscles=json.dumps(item["secondary_muscles"], ensure_ascii=False),
                instructions_es=item["instructions_es"],
                instructions_en=item["instructions_en"],
                instruction_steps_es=json.dumps(item["instruction_steps_es"], ensure_ascii=False),
                image=item["image"],
                gif_url=item["gif_url"],
                attribution=item["attribution"],
            )
        )
        created += 1
    db.commit()
    print(f"Ejercicios importados ({created} nuevos, {len(existing_ids)} ya existían).")


def get_or_create_user(
    db: Session,
    *,
    email: str,
    name: str,
    password: str,
    role: RoleEnum,
    weight_unit: WeightUnitEnum,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        name=name,
        password_hash=hash_password(password),
        role=role,
        weight_unit=weight_unit,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def pick_exercises(db: Session, body_part: str, equipment: list[str], take: int) -> list[Exercise]:
    return (
        db.query(Exercise)
        .filter(Exercise.body_part == body_part, Exercise.equipment.in_(equipment))
        .order_by(Exercise.id.asc())
        .limit(take)
        .all()
    )


def seed_users_and_plan(db: Session) -> None:
    trainer = get_or_create_user(
        db,
        email="trainer@gymcristiano.app",
        name="Coach Cristiano",
        password="Entrenador123!",
        role=RoleEnum.TRAINER,
        weight_unit=WeightUnitEnum.KG,
    )
    print(f"Entrenador demo: {trainer.email} / Entrenador123!")

    alumno1 = get_or_create_user(
        db,
        email="alumno1@gymcristiano.app",
        name="Marco Torres",
        password="Alumno123!",
        role=RoleEnum.USER,
        weight_unit=WeightUnitEnum.KG,
    )
    alumno2 = get_or_create_user(
        db,
        email="alumno2@gymcristiano.app",
        name="Laura Gómez",
        password="Alumno123!",
        role=RoleEnum.USER,
        weight_unit=WeightUnitEnum.LB,
    )
    print(f"Alumnos demo: {alumno1.email} / Alumno123!  y  {alumno2.email} / Alumno123!")

    # Split clásico de 3 días: Lunes=Empuje, Miércoles=Tirón, Viernes=Piernas.
    push = pick_exercises(db, "chest", ["barbell", "dumbbell"], 2)
    push_shoulders = pick_exercises(db, "shoulders", ["barbell", "dumbbell"], 1)
    pull = pick_exercises(db, "back", ["barbell", "dumbbell", "cable"], 3)
    legs = pick_exercises(db, "upper legs", ["barbell", "dumbbell"], 3)

    plan: list[tuple[int, list[Exercise]]] = [
        (0, [*push, *push_shoulders]),  # Lunes
        (2, pull),  # Miércoles
        (4, legs),  # Viernes
    ]

    for target_user in (alumno1, alumno2):
        for day_of_week, exercises in plan:
            db.query(PlanEntry).filter(
                PlanEntry.user_id == target_user.id, PlanEntry.day_of_week == day_of_week
            ).delete()
            for i, exercise in enumerate(exercises):
                db.add(
                    PlanEntry(
                        user_id=target_user.id,
                        day_of_week=day_of_week,
                        exercise_id=exercise.id,
                        position=i,
                        sets=4,
                        reps=10,
                    )
                )
    db.commit()
    print("Plan semanal asignado a ambos alumnos.")

    # Historial de entrenamiento realista solo para alumno1, con peso
    # creciente semana a semana, para que el gráfico de progreso
    # muestre una tendencia visible al primer vistazo. alumno2 queda
    # con plan pero sin historial, para probar el estado "sin
    # entrenos todavía" en el panel del entrenador.
    today = datetime.now(timezone.utc).date()
    base_weights: dict[str, float] = {}

    for week in (3, 2, 1):
        for day_of_week, exercises in plan:
            days_back = week * 7 - day_of_week
            session_date = today - timedelta(days=days_back)
            date_key = today_date_key(session_date)

            session = (
                db.query(WorkoutSession)
                .filter(WorkoutSession.user_id == alumno1.id, WorkoutSession.date_key == date_key)
                .first()
            )
            if not session:
                session = WorkoutSession(
                    user_id=alumno1.id,
                    day_of_week=day_of_week,
                    date_key=date_key,
                    date=datetime.combine(session_date, datetime.min.time(), tzinfo=timezone.utc),
                    completed=True,
                )
                db.add(session)
                db.commit()
                db.refresh(session)

            for exercise in exercises:
                if exercise.id not in base_weights:
                    base_weights[exercise.id] = 40.0 if exercise.equipment == "barbell" else 12.0
                week_index = 3 - week  # 0, 1, 2
                weight_kg = base_weights[exercise.id] + week_index * 2.5

                for set_number in range(1, 5):
                    existing_set = (
                        db.query(SetLog)
                        .filter(
                            SetLog.session_id == session.id,
                            SetLog.exercise_id == exercise.id,
                            SetLog.set_number == set_number,
                        )
                        .first()
                    )
                    if not existing_set:
                        db.add(
                            SetLog(
                                session_id=session.id,
                                exercise_id=exercise.id,
                                set_number=set_number,
                                weight_kg=weight_kg,
                                reps=10,
                            )
                        )
    db.commit()
    print("Historial de entrenamiento generado para alumno1.")


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_exercises(db)
        seed_users_and_plan(db)
    finally:
        db.close()
    print("\n🌱 Seed completo.")


if __name__ == "__main__":
    main()
