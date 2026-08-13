import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { hashPassword } from "../src/lib/auth";
import { todayDateKey } from "../src/lib/constants";

// El seed usa el adapter HTTP (fetch puro, sin WebSocket) a propósito:
// corre desde entornos locales/CI que a veces no permiten salida
// WebSocket (solo HTTPS), y no necesita transacciones interactivas.
// La app en runtime (src/lib/prisma.ts) usa el pool WS (PrismaNeon)
// porque Cloudflare Workers sí lo soporta nativamente.
const adapter = new PrismaNeonHTTP(process.env.DATABASE_URL ?? "", {});
const prisma = new PrismaClient({ adapter });

type SeedExercise = {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  instructions_es: string;
  instructions_en: string;
  instruction_steps_es: string[];
  image: string;
  gif_url: string;
  attribution: string;
};

async function seedExercises() {
  const dataPath = fileURLToPath(
    new URL("./data/exercises.seed.json", import.meta.url),
  );
  const raw = readFileSync(dataPath, "utf-8");
  const exercises: SeedExercise[] = JSON.parse(raw);

  console.log(`Importando ${exercises.length} ejercicios...`);
  for (const e of exercises) {
    await prisma.exercise.upsert({
      where: { id: e.id },
      create: {
        id: e.id,
        name: e.name,
        searchName: e.name.toLowerCase(),
        category: e.category,
        bodyPart: e.body_part,
        equipment: e.equipment,
        muscleGroup: e.muscle_group,
        secondaryMuscles: JSON.stringify(e.secondary_muscles),
        target: e.target,
        instructionsEs: e.instructions_es,
        instructionsEn: e.instructions_en,
        instructionStepsEs: JSON.stringify(e.instruction_steps_es),
        image: e.image,
        gifUrl: e.gif_url,
        attribution: e.attribution,
      },
      update: {
        name: e.name,
        searchName: e.name.toLowerCase(),
        category: e.category,
        bodyPart: e.body_part,
        equipment: e.equipment,
        muscleGroup: e.muscle_group,
        secondaryMuscles: JSON.stringify(e.secondary_muscles),
        target: e.target,
        instructionsEs: e.instructions_es,
        instructionsEn: e.instructions_en,
        instructionStepsEs: JSON.stringify(e.instruction_steps_es),
        image: e.image,
        gifUrl: e.gif_url,
        attribution: e.attribution,
      },
    });
  }
  console.log("Ejercicios importados.");
}

async function pickExercises(
  bodyPart: string,
  equipment: string[],
  take: number,
) {
  return prisma.exercise.findMany({
    where: { bodyPart, equipment: { in: equipment } },
    take,
    orderBy: { id: "asc" },
  });
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// El adapter HTTP (ver arriba) no soporta las transacciones internas
// que Prisma usa para `upsert()` en algunos modelos (falla con
// "Transactions are not supported in HTTP mode"). Todos los `update`
// de este seed son no-op de cualquier forma (solo nos interesa
// idempotencia al re-ejecutar), así que reemplazamos upsert por un
// find-o-create simple, que sí es un statement único.
async function findOrCreate<T>(
  find: () => Promise<T | null>,
  create: () => Promise<T>,
): Promise<T> {
  const existing = await find();
  return existing ?? create();
}

async function seedUsersAndPlan() {
  const trainerPassword = await hashPassword("Entrenador123!");
  const trainer = await findOrCreate(
    () => prisma.user.findUnique({ where: { email: "trainer@gymcristiano.app" } }),
    () =>
      prisma.user.create({
        data: {
          email: "trainer@gymcristiano.app",
          name: "Coach Cristiano",
          passwordHash: trainerPassword,
          role: "TRAINER",
        },
      }),
  );
  console.log(`Entrenador demo: ${trainer.email} / Entrenador123!`);

  const alumno1Password = await hashPassword("Alumno123!");
  const alumno1 = await findOrCreate(
    () => prisma.user.findUnique({ where: { email: "alumno1@gymcristiano.app" } }),
    () =>
      prisma.user.create({
        data: {
          email: "alumno1@gymcristiano.app",
          name: "Marco Torres",
          passwordHash: alumno1Password,
          role: "USER",
          weightUnit: "KG",
        },
      }),
  );

  const alumno2Password = await hashPassword("Alumno123!");
  const alumno2 = await findOrCreate(
    () => prisma.user.findUnique({ where: { email: "alumno2@gymcristiano.app" } }),
    () =>
      prisma.user.create({
        data: {
          email: "alumno2@gymcristiano.app",
          name: "Laura Gómez",
          passwordHash: alumno2Password,
          role: "USER",
          weightUnit: "LB",
        },
      }),
  );
  console.log(
    `Alumnos demo: ${alumno1.email} / Alumno123!  y  ${alumno2.email} / Alumno123!`,
  );

  // Split clásico de 3 días: Lunes=Empuje, Miércoles=Tirón, Viernes=Piernas.
  const push = await pickExercises("chest", ["barbell", "dumbbell"], 2);
  const pushShoulders = await pickExercises(
    "shoulders",
    ["barbell", "dumbbell"],
    1,
  );
  const pull = await pickExercises("back", ["barbell", "dumbbell", "cable"], 3);
  const legs = await pickExercises(
    "upper legs",
    ["barbell", "dumbbell"],
    3,
  );

  const plan: { dayOfWeek: number; exercises: typeof push }[] = [
    { dayOfWeek: 0, exercises: [...push, ...pushShoulders] }, // Lunes
    { dayOfWeek: 2, exercises: pull }, // Miércoles
    { dayOfWeek: 4, exercises: legs }, // Viernes
  ];

  for (const targetUser of [alumno1, alumno2]) {
    for (const day of plan) {
      await prisma.planEntry.deleteMany({
        where: { userId: targetUser.id, dayOfWeek: day.dayOfWeek },
      });
      let order = 0;
      for (const exercise of day.exercises) {
        await prisma.planEntry.create({
          data: {
            userId: targetUser.id,
            dayOfWeek: day.dayOfWeek,
            exerciseId: exercise.id,
            order: order++,
            sets: 4,
            reps: 10,
          },
        });
      }
    }
  }
  console.log("Plan semanal asignado a ambos alumnos.");

  // Historial de entrenamiento realista solo para alumno1, con peso
  // creciente semana a semana, para que ProgressChart muestre tendencia.
  const today = new Date();
  const weeksAgo = [3, 2, 1]; // 3 semanas de sesiones por cada día del split
  const baseWeights: Record<string, number> = {};

  for (const week of weeksAgo) {
    for (const day of plan) {
      // Aproxima la fecha real hacia atrás manteniendo separación de días.
      const daysBack = week * 7 - day.dayOfWeek;
      const date = addDays(today, -daysBack);
      const dateKey = todayDateKey(date);

      const session = await findOrCreate(
        () =>
          prisma.workoutSession.findUnique({
            where: { userId_dateKey: { userId: alumno1.id, dateKey } },
          }),
        () =>
          prisma.workoutSession.create({
            data: {
              userId: alumno1.id,
              dayOfWeek: day.dayOfWeek,
              dateKey,
              date,
              completed: true,
            },
          }),
      );

      for (const exercise of day.exercises) {
        if (!(exercise.id in baseWeights)) {
          baseWeights[exercise.id] =
            exercise.equipment === "barbell" ? 40 : 12;
        }
        const weekIndex = 3 - week; // 0, 1, 2
        const weightKg = baseWeights[exercise.id] + weekIndex * 2.5;

        for (let setNumber = 1; setNumber <= 4; setNumber++) {
          await findOrCreate(
            () =>
              prisma.setLog.findUnique({
                where: {
                  sessionId_exerciseId_setNumber: {
                    sessionId: session.id,
                    exerciseId: exercise.id,
                    setNumber,
                  },
                },
              }),
            () =>
              prisma.setLog.create({
                data: {
                  sessionId: session.id,
                  exerciseId: exercise.id,
                  setNumber,
                  weightKg,
                  reps: 10,
                },
              }),
          );
        }
      }
    }
  }
  console.log("Historial de entrenamiento generado para alumno1.");
}

async function main() {
  await seedExercises();
  await seedUsersAndPlan();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
