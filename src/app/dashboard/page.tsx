import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getWeeklyPlan } from "@/lib/plan";
import { WeekPlanView } from "@/components/user/WeekPlanView";

export const metadata: Metadata = { title: "Mi semana — Gym Cristiano" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const days = user ? await getWeeklyPlan(user.id) : [];
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">
          Tu semana
        </p>
        <h1 className="font-display text-3xl tracking-wide text-cream">
          ¿Qué toca hoy, {firstName}?
        </h1>
      </header>
      <WeekPlanView days={days} />
    </div>
  );
}
