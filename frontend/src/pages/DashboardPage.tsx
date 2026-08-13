import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { WeekPlanView } from "../components/user/WeekPlanView";
import { Spinner } from "../components/ui/Spinner";
import type { PlanDayOut } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [days, setDays] = useState<PlanDayOut[] | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<PlanDayOut[]>("/plan/me")
      .then((data) => {
        if (active) setDays(data);
      })
      .catch(() => {
        if (active) setDays([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">Tu semana</p>
        <h1 className="font-display text-3xl tracking-wide text-cream">
          ¿Qué toca hoy, {firstName}?
        </h1>
      </header>

      {days === null ? (
        <div className="flex justify-center py-10 text-cream-dim">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <WeekPlanView days={days} />
      )}
    </div>
  );
}
