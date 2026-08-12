# Gym Cristiano App

App de entrenamiento con panel de entrenador y bitácora de progreso para
el alumno, con estética "gym rat" futurista y toques americana
old-school. Next.js (App Router) + TypeScript + Tailwind + Prisma/SQLite.

## Qué incluye

- **Login / registro** con autoregistro abierto para alumnos (rol
  `USER`) y alta manual de alumnos desde el panel del entrenador.
- **Panel de entrenador** (`/trainer`): lista de alumnos, editor de plan
  semanal por día (combobox con búsqueda sobre las 1324 entradas del
  dataset de ejercicios) y vista de progreso (historial de sesiones +
  gráfico de peso por ejercicio en el tiempo).
- **Panel de alumno** (`/dashboard`): selector de día de la semana,
  tarjetas con los ejercicios asignados, detalle de cada ejercicio (gif
  animado, instrucciones paso a paso en español, atribución del
  dataset) y una pantalla de entrenamiento con contador/stepper de peso
  y repeticiones por serie.
- Unidad de peso configurable por usuario (kg/lb); se guarda siempre en
  kg y se convierte al mostrarse.

## Dataset de ejercicios

Los datos de ejercicios (nombre, grupo muscular, instrucciones, imagen
y gif) vienen del dataset público
[`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset)
(© Gym visual, atribución visible en cada detalle de ejercicio). El
JSON recortado (español/inglés, sin binarios) vive versionado en
`prisma/data/exercises.seed.json`; las imágenes y gifs se sirven en
runtime desde jsDelivr, nunca se vendorizan en este repo.

## Puesta en marcha

```bash
npm install
npx prisma migrate dev   # crea prisma/dev.db con el esquema
npx prisma db seed       # importa los 1324 ejercicios + cuentas demo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Si alguna vez necesitás regenerar `prisma/data/exercises.seed.json`
desde el dataset original:

```bash
npm run db:fetch-exercises
```

### Cuentas demo (creadas por el seed)

| Rol        | Email                        | Contraseña       |
| ---------- | ----------------------------- | ----------------- |
| Entrenador | trainer@gymcristiano.app      | Entrenador123!     |
| Alumno     | alumno1@gymcristiano.app      | Alumno123!         |
| Alumno     | alumno2@gymcristiano.app      | Alumno123!         |

`alumno1` trae plan semanal + varias semanas de historial (para ver el
gráfico de progreso); `alumno2` trae plan pero sin historial, para
probar el estado vacío.

## Stack

- **Next.js 16 (App Router)** + TypeScript — un solo proyecto
  full-stack (páginas + Route Handlers).
- **Tailwind CSS v4** — tema custom en `src/app/globals.css` (paleta,
  tipografías, sombras neón).
- **Prisma + SQLite** (`@prisma/adapter-better-sqlite3`) — cero
  infraestructura externa.
- **Auth propia**: `bcryptjs` + `jose` (JWT en cookie httpOnly), roles
  `TRAINER`/`USER`, protegidos en `src/proxy.ts` (el `middleware.ts` de
  Next 15 se renombró a `proxy.ts` en Next 16).

## Variables de entorno

Ver `.env.example`. `DATABASE_URL` (SQLite local) y `JWT_SECRET` (clave
de firma de sesión).
