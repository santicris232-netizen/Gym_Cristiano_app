import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toExerciseSummary } from "@/lib/dto";
import { getCurrentUser } from "@/lib/session";
import { jsDayToPlanDay } from "@/lib/constants";
import { TrainScreen } from "@/components/user/TrainScreen";

export default async function TrainPage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { exerciseId } = await params;
  const sp = await searchParams;

  const [exercise, user] = await Promise.all([
    prisma.exercise.findUnique({ where: { id: exerciseId } }),
    getCurrentUser(),
  ]);
  if (!exercise || !user) notFound();

  const sets = Math.max(1, Number(sp.sets) || 3);
  const reps = Math.max(1, Number(sp.reps) || 10);
  const dayParam = Number(sp.day);
  const dayOfWeek = Number.isInteger(dayParam)
    ? dayParam
    : jsDayToPlanDay(new Date().getDay());

  return (
    <TrainScreen
      exercise={toExerciseSummary(exercise)}
      plannedSets={sets}
      plannedReps={reps}
      dayOfWeek={dayOfWeek}
      weightUnit={user.weightUnit}
    />
  );
}
