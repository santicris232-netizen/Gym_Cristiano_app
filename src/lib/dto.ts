import type { Exercise } from "@/generated/prisma/client";
import { exerciseImageUrl, exerciseGifUrl } from "@/lib/exercise-media";
import type { ExerciseSummary, ExerciseDetail } from "@/types";

export function toExerciseSummary(e: Exercise): ExerciseSummary {
  return {
    id: e.id,
    name: e.name,
    image: exerciseImageUrl(e.image),
    bodyPart: e.bodyPart,
    equipment: e.equipment,
    target: e.target,
  };
}

export function toExerciseDetail(e: Exercise): ExerciseDetail {
  return {
    ...toExerciseSummary(e),
    category: e.category,
    muscleGroup: e.muscleGroup,
    secondaryMuscles: JSON.parse(e.secondaryMuscles) as string[],
    instructionsEs: e.instructionsEs,
    instructionStepsEs: JSON.parse(e.instructionStepsEs) as string[],
    gifUrl: exerciseGifUrl(e.gifUrl),
    attribution: e.attribution,
  };
}
