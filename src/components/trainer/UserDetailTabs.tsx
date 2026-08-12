"use client";

import { useState } from "react";
import { WeeklyPlanEditor } from "@/components/trainer/WeeklyPlanEditor";
import { ProgressPanel } from "@/components/trainer/ProgressPanel";
import type { PlanDayDTO } from "@/types";
import type { WeightUnit } from "@/generated/prisma/client";

type Tab = "plan" | "progreso";

export function UserDetailTabs({
  userId,
  weightUnit,
  initialDays,
}: {
  userId: string;
  weightUnit: WeightUnit;
  initialDays: PlanDayDTO[];
}) {
  const [tab, setTab] = useState<Tab>("plan");

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-line">
        {(["plan", "progreso"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold tracking-wide uppercase transition ${
              tab === t
                ? "border-neon-blue text-neon-blue"
                : "border-transparent text-cream-dim hover:text-cream"
            }`}
          >
            {t === "plan" ? "Plan semanal" : "Progreso"}
          </button>
        ))}
      </div>

      {tab === "plan" ? (
        <WeeklyPlanEditor userId={userId} initialDays={initialDays} />
      ) : (
        <ProgressPanel userId={userId} weightUnit={weightUnit} planDays={initialDays} />
      )}
    </div>
  );
}
