"use client";

import { useState } from "react";
import { DaySelector } from "@/components/user/DaySelector";
import { ExerciseDayCard } from "@/components/user/ExerciseDayCard";
import { jsDayToPlanDay } from "@/lib/constants";
import type { PlanDayDTO } from "@/types";

export function WeekPlanView({ days }: { days: PlanDayDTO[] }) {
  const [activeDay, setActiveDay] = useState(() =>
    jsDayToPlanDay(new Date().getDay()),
  );
  const dayData = days[activeDay];

  return (
    <div>
      <DaySelector days={days} activeDay={activeDay} onChange={setActiveDay} />
      <div className="mt-5 space-y-3">
        {!dayData || dayData.entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-cream-dim">
            Día libre — sin ejercicios asignados. Aprovechá para descansar o
            hacer cardio suave.
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
