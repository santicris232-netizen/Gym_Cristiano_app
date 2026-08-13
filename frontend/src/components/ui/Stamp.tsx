import { BarbellIcon, StarIcon } from "./icons";

/** Sello circular decorativo estilo "parche" vintage de gimnasio. */
export function Stamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 border-neon-gold/70 shadow-neon-gold ${className}`}
    >
      <div className="absolute inset-1.5 rounded-full border border-dashed border-neon-gold/40" />
      <div className="flex flex-col items-center gap-1 font-mono text-neon-gold">
        <StarIcon className="h-2.5 w-2.5" />
        <span className="text-[9px] uppercase tracking-[0.2em]">Gym</span>
        <BarbellIcon className="my-0.5 h-5 w-5" />
        <span className="text-[9px] uppercase tracking-[0.2em]">Cristiano</span>
        <span className="text-[7px] uppercase tracking-[0.15em] text-cream-dim">Est. 2026</span>
      </div>
    </div>
  );
}
