import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _new_id() -> str:
    return uuid.uuid4().hex


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class RoleEnum(str, Enum):
    TRAINER = "TRAINER"
    USER = "USER"


class WeightUnitEnum(str, Enum):
    KG = "KG"
    LB = "LB"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        SAEnum(RoleEnum, native_enum=False, length=16), default=RoleEnum.USER, nullable=False
    )
    weight_unit: Mapped[WeightUnitEnum] = mapped_column(
        SAEnum(WeightUnitEnum, native_enum=False, length=8), default=WeightUnitEnum.KG, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    plan_entries: Mapped[list["PlanEntry"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Exercise(Base):
    """Ejercicio importado del dataset público "exercises-dataset"
    (github.com/hasaneyldrm/exercises-dataset). id/name/etc. calcan el
    dataset original (recortado a es/en); image y gif_url son rutas
    relativas del dataset, servidas en runtime vía jsDelivr (ver
    app/utils.py: exercise_media_url)."""

    __tablename__ = "exercises"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)  # "0001".."1324"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    search_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    body_part: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    equipment: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    muscle_group: Mapped[str] = mapped_column(String(64), nullable=False)
    target: Mapped[str] = mapped_column(String(64), nullable=False)
    secondary_muscles: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string: list[str]
    instructions_es: Mapped[str] = mapped_column(Text, nullable=False)
    instructions_en: Mapped[str] = mapped_column(Text, nullable=False)
    instruction_steps_es: Mapped[str] = mapped_column(Text, nullable=False)  # JSON string: list[str]
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    gif_url: Mapped[str] = mapped_column(String(255), nullable=False)
    attribution: Mapped[str] = mapped_column(String(255), nullable=False)

    plan_entries: Mapped[list["PlanEntry"]] = relationship(back_populates="exercise")
    set_logs: Mapped[list["SetLog"]] = relationship(back_populates="exercise")


class PlanEntry(Base):
    """Un ejercicio asignado por el entrenador a un alumno en un día
    concreto de la semana (0=Lunes..6=Domingo)."""

    __tablename__ = "plan_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "day_of_week", "exercise_id", name="uq_plan_entry_user_day_exercise"),
        Index("ix_plan_entry_user_day", "user_id", "day_of_week"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    exercise_id: Mapped[str] = mapped_column(String(16), ForeignKey("exercises.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sets: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    reps: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="plan_entries")
    exercise: Mapped["Exercise"] = relationship(back_populates="plan_entries")


class WorkoutSession(Base):
    """Una sesión de entrenamiento real del alumno en un día concreto.
    date_key ("YYYY-MM-DD") garantiza como máximo una sesión por día y
    sirve para saber en qué días entrenó."""

    __tablename__ = "workout_sessions"
    __table_args__ = (
        UniqueConstraint("user_id", "date_key", name="uq_session_user_datekey"),
        Index("ix_session_user_date", "user_id", "date"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    date_key: Mapped[str] = mapped_column(String(10), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)

    user: Mapped["User"] = relationship(back_populates="sessions")
    set_logs: Mapped[list["SetLog"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class SetLog(Base):
    """Una serie registrada por el alumno para un ejercicio dentro de
    una sesión. weight_kg siempre se guarda en kilogramos (canónico);
    la conversión a la unidad preferida del usuario ocurre al servir
    la respuesta (ver app/utils.py)."""

    __tablename__ = "set_logs"
    __table_args__ = (
        UniqueConstraint("session_id", "exercise_id", "set_number", name="uq_setlog_session_exercise_set"),
        Index("ix_setlog_exercise", "exercise_id"),
        Index("ix_setlog_session", "session_id"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    session_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[str] = mapped_column(String(16), ForeignKey("exercises.id"), nullable=False)
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)

    session: Mapped["WorkoutSession"] = relationship(back_populates="set_logs")
    exercise: Mapped["Exercise"] = relationship(back_populates="set_logs")
