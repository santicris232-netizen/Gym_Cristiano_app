function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function Stepper({
  label,
  value,
  step,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-xs tracking-widest text-cream-dim uppercase">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, round1(value - step)))}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line text-2xl text-cream-dim transition hover:border-neon-blue hover:text-neon-blue active:scale-95"
          aria-label={`Reducir ${label}`}
        >
          −
        </button>
        <div className="w-20 font-counter text-4xl tracking-wide text-cream tabular-nums">
          {value}
        </div>
        <button
          type="button"
          onClick={() => onChange(round1(value + step))}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line text-2xl text-cream-dim transition hover:border-neon-blue hover:text-neon-blue active:scale-95"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
