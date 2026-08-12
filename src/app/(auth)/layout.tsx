import type { ReactNode } from "react";
import { Stamp } from "@/components/ui/Stamp";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-grain bg-scanlines relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="stripe-usa absolute inset-x-0 top-0 h-1.5" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-neon-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-neon-gold/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Stamp />
          <h1 className="font-display text-3xl tracking-wide text-cream sm:text-4xl">
            GYM{" "}
            <span className="text-outline-neon text-neon-blue">
              CRISTIANO
            </span>
          </h1>
          <p className="max-w-xs font-mono text-xs tracking-[0.2em] text-cream-dim uppercase">
            Disciplina de siempre. Progreso medido.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface/90 p-6 shadow-card backdrop-blur sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
