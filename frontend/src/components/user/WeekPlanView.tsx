import { useState } from "react";
import { DaySelector } from "./DaySelector";
import { ExerciseDayCard } from "./ExerciseDayCard";
import { todayDayOfWeek } from "../../lib/constants";
import type { PlanDayOut } from "../../types";

export function WeekPlanView({ days }: { days: PlanDayOut[] }) {
  const [activeDay, setActiveDay] = useState(() => todayDayOfWeek());
  const dayData = days[activeDay];

  return (
    <div>
      <DaySelector days={days} activeDay={activeDay} onChange={setActiveDay} />
      <div className="mt-5 space-y-3">
        {!dayData || dayData.entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-cream-dim">
            Día libre — sin ejercicios asignados. Aprovechá para descansar o hacer cardio suave.
          </p>
        ) : (
          dayData.entries.map((entry) => (
            <ExerciseDayCard key={entry.id} entry={entry} dayOfWeek={activeDay} />
          ))
        )}
      </div>
    </div>
  );
}
