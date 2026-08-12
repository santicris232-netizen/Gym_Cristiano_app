import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toExerciseDetail } from "@/lib/dto";
import { ExerciseDetailView } from "@/components/user/ExerciseDetailView";

export default async function ExerciseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { exerciseId } = await params;
  const sp = await searchParams;

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });
  if (!exercise) notFound();

  const detail = toExerciseDetail(exercise);
  const sets = Math.max(1, Number(sp.sets) || 3);
  const reps = Math.max(1, Number(sp.reps) || 10);
  const dayParam = Number(sp.day);

  return (
    <ExerciseDetailView
      exercise={detail}
      sets={sets}
      reps={reps}
      dayOfWeek={Number.isInteger(dayParam) ? dayParam : undefined}
    />
  );
}
