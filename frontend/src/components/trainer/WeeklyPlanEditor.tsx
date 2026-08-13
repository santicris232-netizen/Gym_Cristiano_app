import { useState } from "react";
import { DayPlanEditor } from "./DayPlanEditor";
import { DAY_SHORT_NAMES, DAY_NAMES } from "../../lib/constants";
import type { PlanDayOut } from "../../types";

export function WeeklyPlanEditor({
  userId,
  initialDays,
}: {
  userId: string;
  initialDays: PlanDayOut[];
}) {
  const [days, setDays] = useState(initialDays);
  const [activeDay, setActiveDay] = useState(0);

  const activeDayData = days[activeDay];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {DAY_SHORT_NAMES.map((label, i) => {
          const hasEntries = days[i].entries.length > 0;
          const active = activeDay === i;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveDay(i)}
              title={DAY_NAMES[i]}
              className={`relative rounded-md border px-3.5 py-2 font-counter text-base tracking-wide transition ${
                active
                  ? "border-neon-blue bg-surface text-neon-blue shadow-neon"
                  : "border-line text-cream-dim hover:text-cream"
              }`}
            >
              {label}
              {hasEntries && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-neon-gold" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mb-3 font-mono text-xs tracking-widest text-cream-dim uppercase">
        {DAY_NAMES[activeDay]}
      </p>

      <DayPlanEditor
        key={activeDay}
        userId={userId}
        dayOfWeek={activeDay}
        initialEntries={activeDayData.entries}
        onSaved={(entries) => {
          setDays((prev) => prev.map((d, i) => (i === activeDay ? { ...d, entries } : d)));
        }}
      />
    </div>
  );
}
