import {
  DATASET_ATTRIBUTION_URL,
  DATASET_SOURCE_URL,
} from "@/lib/exercise-media";

export function AttributionFooter({ attribution }: { attribution: string }) {
  return (
    <p className="font-mono text-[11px] leading-relaxed text-cream-dim/70">
      {attribution}{" "}
      <a
        href={DATASET_ATTRIBUTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted hover:text-neon-blue"
      >
        gymvisual.com
      </a>
      {" · datos: "}
      <a
        href={DATASET_SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted hover:text-neon-blue"
      >
        exercises-dataset
      </a>
    </p>
  );
}
