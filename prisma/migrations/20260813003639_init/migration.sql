-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRAINER', 'USER');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LB');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secondaryMuscles" TEXT NOT NULL,
    "instructionsEs" TEXT NOT NULL,
    "instructionsEn" TEXT NOT NULL,
    "instructionStepsEs" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "gifUrl" TEXT NOT NULL,
    "attribution" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "dateKey" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Exercise_bodyPart_idx" ON "Exercise"("bodyPart");

-- CreateIndex
CREATE INDEX "Exercise_equipment_idx" ON "Exercise"("equipment");

-- CreateIndex
CREATE INDEX "Exercise_searchName_idx" ON "Exercise"("searchName");

-- CreateIndex
CREATE INDEX "PlanEntry_userId_dayOfWeek_idx" ON "PlanEntry"("userId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "PlanEntry_userId_dayOfWeek_exerciseId_key" ON "PlanEntry"("userId", "dayOfWeek", "exerciseId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_date_idx" ON "WorkoutSession"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSession_userId_dateKey_key" ON "WorkoutSession"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "SetLog_exerciseId_idx" ON "SetLog"("exerciseId");

-- CreateIndex
CREATE INDEX "SetLog_sessionId_idx" ON "SetLog"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SetLog_sessionId_exerciseId_setNumber_key" ON "SetLog"("sessionId", "exerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "PlanEntry" ADD CONSTRAINT "PlanEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEntry" ADD CONSTRAINT "PlanEntry_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

