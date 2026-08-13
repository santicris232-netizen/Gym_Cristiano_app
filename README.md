# Gym Cristiano App

App de entrenamiento con panel de entrenador y bitácora de progreso para
el alumno, con estética "gym rat" futurista y toques americana
old-school.

**Backend**: Python — FastAPI + SQLAlchemy + SQLite (archivo local, sin
infraestructura externa). Auth propia con JWT en cookie httpOnly y
bcrypt.
**Frontend**: React + Vite + TypeScript + Tailwind CSS (SPA).

Ambos arrancan cada uno con un solo comando y no dependen de ningún
servicio externo (ni base de datos remota, ni cuentas de terceros) —
las únicas llamadas de red en runtime son a jsDelivr para traer las
imágenes/gifs del dataset de ejercicios.

## Qué incluye

- **Login / registro**: autoregistro abierto para alumnos (rol `USER`)
  y alta manual de alumnos desde el panel del entrenador.
- **Panel de entrenador** (`/trainer`): lista de alumnos, editor de
  plan semanal por día (0=Lunes..6=Domingo) con buscador sobre las
  1324 entradas del dataset de ejercicios, y vista de progreso
  (historial de sesiones + gráfico de peso por ejercicio en el tiempo
  — incluye ejercicios entrenados en el pasado aunque ya no estén en
  el plan actual).
- **Panel de alumno** (`/dashboard`): selector de día, tarjetas de los
  ejercicios asignados, detalle de cada ejercicio (gif animado,
  instrucciones paso a paso en español, atribución del dataset) y una
  pantalla de entrenamiento con stepper de peso y repeticiones por
  serie.
- Unidad de peso configurable por usuario (kg/lb): se guarda siempre
  en kg y se convierte al mostrarse.

## Dataset de ejercicios

Los datos de ejercicios (nombre, grupo muscular, instrucciones, imagen
y gif) vienen del dataset público
[`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset)
(© Gym visual, atribución visible en cada detalle de ejercicio). El
JSON recortado (español/inglés, sin binarios) vive versionado en
`backend/data/exercises.seed.json`; las imágenes y gifs se sirven en
runtime desde jsDelivr, nunca se vendorizan en este repo.

## Puesta en marcha

Necesitás Python 3.11+ y Node 20+. Se levantan dos procesos, cada uno
con un solo comando.

### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py                   # crea backend/gym.db, importa los 1324 ejercicios y las cuentas demo
uvicorn app.main:app --reload --port 8000
```

La API queda en `http://localhost:8000` (docs interactivas en
`http://localhost:8000/docs`).

### 2. Frontend (Vite)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173). En desarrollo,
Vite proxea `/api/*` al backend (ver `frontend/vite.config.ts`), así
que no hace falta configurar CORS a mano ni tocar variables de
entorno del frontend.

### Cuentas demo (creadas por `seed.py`)

| Rol        | Email                     | Contraseña      |
| ---------- | -------------------------- | ---------------- |
| Entrenador | trainer@gymcristiano.app   | Entrenador123!    |
| Alumno     | alumno1@gymcristiano.app   | Alumno123!        |
| Alumno     | alumno2@gymcristiano.app   | Alumno123!        |

`alumno1` trae plan semanal + varias semanas de historial (para ver el
gráfico de progreso); `alumno2` trae plan pero sin historial, para
probar el estado vacío. `seed.py` es idempotente: correrlo de nuevo no
duplica datos.

## Estructura

```
backend/
  app/
    main.py              # FastAPI app + CORS + routers
    config.py             # settings vía .env (pydantic-settings)
    database.py            # engine/session SQLAlchemy
    models.py                # User, Exercise, PlanEntry, WorkoutSession, SetLog
    schemas.py                 # DTOs Pydantic
    security.py                 # bcrypt + JWT (cookie httpOnly)
    deps.py                      # get_current_user, require_role
    dto.py                        # mapeo modelo -> DTO, plan semanal
    utils.py                       # conversión kg/lb, urls del dataset, etc.
    routers/                        # auth, users, exercises, plan, me, sessions
  data/exercises.seed.json           # dataset recortado, versionado
  seed.py                              # script de seed
  requirements.txt

frontend/
  src/
    lib/                # cliente API, unidades, constantes
    context/              # AuthContext (sesión actual)
    components/
      ui/                    # Button, Card, Badge, Input, Stamp, etc.
      layout/                  # NavBar, AppLayout, AuthLayout, guards de ruta
      auth/                      # LoginForm, RegisterForm
      trainer/                     # lista de alumnos, editor de plan, progreso
      user/                          # selector de día, detalle de ejercicio, stepper
    pages/                              # una página por ruta
  public/fonts/, public/textures/          # tipografías (self-hosted) y textura de grano
```

## Variables de entorno

`backend/.env.example` documenta `DATABASE_URL` (SQLite local por
defecto) y `JWT_SECRET`. Ninguna es obligatoria para desarrollo local
(ambas tienen default), pero para cualquier uso real generá tu propio
secreto:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Notas de diseño

- Paleta y tipografías en `frontend/src/index.css` (`--color-ink`,
  `--color-cream`, `--color-neon-blue`, `--color-neon-gold`,
  `--color-usa-red`) — dark base, acentos neón azul/dorado, rojo "USA"
  reservado a detalles puntuales.
- El backend guarda el peso siempre en kilogramos (`weight_kg`); la
  conversión a la unidad preferida del usuario ocurre en el frontend
  (`frontend/src/lib/units.ts`) para mostrar, y al enviar una serie el
  backend convierte de la unidad del usuario a kg antes de persistir.
