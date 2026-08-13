from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, exercises, me, plan, sessions, users

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # SQLite local, sin infraestructura externa: crea el archivo/tablas
    # si todavía no existen (correr `python seed.py` aparte para los
    # datos de ejemplo).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Gym Cristiano App API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(exercises.router)
app.include_router(plan.router)
app.include_router(me.router)
app.include_router(sessions.router)


@app.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}
