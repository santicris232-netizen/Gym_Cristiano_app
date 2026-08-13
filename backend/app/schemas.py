from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import RoleEnum, WeightUnitEnum

# ---------------------------------------------------------------- auth / user

class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: RoleEnum
    weight_unit: WeightUnitEnum

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    weight_unit: WeightUnitEnum = WeightUnitEnum.KG


class CreateUserRequest(BaseModel):
    """Alta manual de un alumno por el entrenador."""

    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    weight_unit: WeightUnitEnum = WeightUnitEnum.KG


class UserSummary(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    last_trained_at: datetime | None


class WeightUnitUpdateRequest(BaseModel):
    weight_unit: WeightUnitEnum


# ---------------------------------------------------------------- exercises

class ExerciseSummary(BaseModel):
    id: str
    name: str
    image: str
    body_part: str
    equipment: str
    target: str


class ExerciseDetail(ExerciseSummary):
    category: str
    muscle_group: str
    secondary_muscles: list[str]
    instructions_es: str
    instruction_steps_es: list[str]
    gif_url: str
    attribution: str


class ExerciseListResponse(BaseModel):
    items: list[ExerciseSummary]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------- plan

class PlanEntryOut(BaseModel):
    id: str
    position: int
    sets: int
    reps: int
    notes: str | None
    exercise: ExerciseSummary


class PlanDayOut(BaseModel):
    day_of_week: int
    entries: list[PlanEntryOut]


class PlanEntryInput(BaseModel):
    exercise_id: str
    position: int | None = None
    sets: int | None = Field(default=None, ge=1, le=20)
    reps: int | None = Field(default=None, ge=1, le=100)
    notes: str | None = None


class PlanDayUpdateRequest(BaseModel):
    entries: list[PlanEntryInput]


# ---------------------------------------------------------------- sessions / progress

class SetLogOut(BaseModel):
    id: str
    exercise_id: str
    exercise_name: str
    set_number: int
    weight_kg: float
    reps: int


class SessionSummaryOut(BaseModel):
    id: str
    date_key: str
    day_of_week: int
    completed: bool
    set_logs: list[SetLogOut]


class ProgressSetPoint(BaseModel):
    set_number: int
    weight_kg: float
    reps: int


class ProgressPointOut(BaseModel):
    session_id: str
    date: datetime
    date_key: str
    max_weight_kg: float
    sets: list[ProgressSetPoint]


class CreateSessionRequest(BaseModel):
    day_of_week: int | None = Field(default=None, ge=0, le=6)


class CreateSessionResponse(BaseModel):
    session_id: str
    date_key: str
    day_of_week: int


class UpsertSetRequest(BaseModel):
    exercise_id: str
    set_number: int = Field(ge=1, le=50)
    weight: float = Field(ge=0)
    reps: int = Field(ge=0, le=1000)


class SetLogSaved(BaseModel):
    id: str
    exercise_id: str
    set_number: int
    weight_kg: float
    reps: int


class SessionDetailOut(BaseModel):
    id: str
    date_key: str
    day_of_week: int
    completed: bool


class SessionWithSetsOut(BaseModel):
    session: SessionDetailOut
    set_logs: list[SetLogSaved]
