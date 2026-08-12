"use client";

import { DAY_SHORT_NAMES, DAY_NAMES, jsDayToPlanDay } from "@/lib/constants";
import type { PlanDayDTO } from "@/types";

export function DaySelector({
  days,
  activeDay,
  onChange,
}: {
  days: PlanDayDTO[];
  activeDay: number;
  onChange: (day: number) => void;
}) {
  const today = jsDayToPlanDay(new Date().getDay());

  return (
    <div className="flex flex-wrap gap-2">
      {DAY_SHORT_NAMES.map((label, i) => {
        const active = activeDay === i;
        const isToday = today === i;
        const hasEntries = (days[i]?.entries.length ?? 0) > 0;
        return (
          <button
            key={label}
            type="button"
            title={DAY_NAMES[i]}
            onClick={() => onChange(i)}
            className={`relative rounded-lg border-2 px-4 py-3 font-counter text-xl tracking-wide transition ${
              active
                ? "border-neon-blue bg-surface text-neon-blue shadow-neon"
                : "border-line text-cream-dim hover:border-cream-dim hover:text-cream"
            }`}
          >
            {label}
            {isToday && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-neon-gold px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-ink uppercase">
                Hoy
              </span>
            )}
            {hasEntries && (
              <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-neon-blue" />
            )}
          </button>
        );
      })}
    </div>
  );
}
