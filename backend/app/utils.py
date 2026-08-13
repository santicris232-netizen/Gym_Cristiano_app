from __future__ import annotations

from datetime import date, datetime

from app.models import WeightUnitEnum

KG_TO_LB = 2.2046226218

DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
DAY_SHORT_NAMES = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"]

BODY_PARTS = [
    "back",
    "cardio",
    "chest",
    "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist",
]

BODY_PART_LABELS_ES = {
    "back": "Espalda",
    "cardio": "Cardio",
    "chest": "Pecho",
    "lower arms": "Antebrazos",
    "lower legs": "Piernas (bajo)",
    "neck": "Cuello",
    "shoulders": "Hombros",
    "upper arms": "Brazos",
    "upper legs": "Piernas",
    "waist": "Abdomen",
}


def body_part_label(body_part: str) -> str:
    return BODY_PART_LABELS_ES.get(body_part, body_part)


def today_day_of_week(d: date | None = None) -> int:
    """0=Lunes..6=Domingo. `date.weekday()` de Python ya usa esta misma
    convención (a diferencia de JS, donde Date#getDay() es 0=Domingo)."""
    d = d or datetime.now().date()
    return d.weekday()


def today_date_key(d: date | None = None) -> str:
    d = d or datetime.now().date()
    return d.isoformat()


def kg_to_lb(kg: float) -> float:
    return kg * KG_TO_LB


def lb_to_kg(lb: float) -> float:
    return lb / KG_TO_LB


def to_display_weight(weight_kg: float, unit: WeightUnitEnum) -> float:
    return kg_to_lb(weight_kg) if unit == WeightUnitEnum.LB else weight_kg


def to_canonical_kg(display_weight: float, unit: WeightUnitEnum) -> float:
    return lb_to_kg(display_weight) if unit == WeightUnitEnum.LB else display_weight


DATASET_CDN_BASE = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/"
DATASET_ATTRIBUTION_URL = "https://gymvisual.com/"
DATASET_SOURCE_URL = "https://github.com/hasaneyldrm/exercises-dataset"


def exercise_media_url(relative_path: str) -> str:
    return f"{DATASET_CDN_BASE}{relative_path}"
