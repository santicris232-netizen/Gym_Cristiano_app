import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { LinkButton } from "../ui/LinkButton";
import { AttributionFooter } from "../ui/AttributionFooter";
import { bodyPartLabel } from "../../lib/constants";
import type { ExerciseDetail } from "../../types";

export function ExerciseDetailView({
  exercise,
  sets,
  reps,
  dayOfWeek,
}: {
  exercise: ExerciseDetail;
  sets: number;
  reps: number;
  dayOfWeek?: number;
}) {
  const trainHref = `/dashboard/ejercicio/${exercise.id}/entrenar?sets=${sets}&reps=${reps}${
    dayOfWeek !== undefined ? `&day=${dayOfWeek}` : ""
  }`;

  return (
    <div>
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-cream-dim uppercase hover:text-neon-blue"
      >
        ← Volver a mi semana
      </Link>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center justify-center bg-surface-2 p-6">
          <img
            src={exercise.gif_url}
            alt={exercise.name}
            className="h-56 w-56 rounded-lg border border-line object-cover"
          />
        </div>

        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge tone="blue">{bodyPartLabel(exercise.body_part)}</Badge>
            <Badge tone="gold">{exercise.equipment}</Badge>
            <Badge tone="neutral">Objetivo: {exercise.target}</Badge>
          </div>

          <h1 className="mb-1 font-display text-2xl tracking-wide text-cream">{exercise.name}</h1>
          <p className="mb-4 font-mono text-sm text-neon-blue">
            {sets} series × {reps} repeticiones
          </p>

          <h2 className="mb-2 font-mono text-xs tracking-widest text-cream-dim uppercase">
            Cómo hacerlo
          </h2>
          <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-cream">
            {exercise.instruction_steps_es.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          {exercise.secondary_muscles.length > 0 && (
            <p className="mb-5 text-xs text-cream-dim">
              Músculos secundarios:{" "}
              {exercise.secondary_muscles.map(bodyPartLabel).join(", ")}
            </p>
          )}

          <LinkButton to={trainHref} className="mb-4 w-full">
            Empezar entrenamiento
          </LinkButton>

          <AttributionFooter attribution={exercise.attribution} />
        </div>
      </div>
    </div>
  );
}
