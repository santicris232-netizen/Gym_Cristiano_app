import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { UserDetailTabs } from "../components/trainer/UserDetailTabs";
import { Spinner } from "../components/ui/Spinner";
import type { PlanDayOut, UserPublic } from "../types";

export function TrainerUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [alumno, setAlumno] = useState<UserPublic | null>(null);
  const [days, setDays] = useState<PlanDayOut[] | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    Promise.all([
      api.get<UserPublic>(`/users/${userId}`),
      api.get<PlanDayOut[]>(`/users/${userId}/plan`),
    ])
      .then(([u, d]) => {
        if (!active) return;
        setAlumno(u);
        setDays(d);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (notFound) {
    return <p className="text-sm text-cream-dim">Alumno no encontrado.</p>;
  }

  if (!alumno || !days || !userId) {
    return (
      <div className="flex justify-center py-10 text-cream-dim">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">Alumno</p>
        <h1 className="font-display text-3xl tracking-wide text-cream">{alumno.name}</h1>
        <p className="font-mono text-sm text-cream-dim">
          {alumno.email} · unidad {alumno.weight_unit}
        </p>
      </header>
      <UserDetailTabs userId={userId} weightUnit={alumno.weight_unit} initialDays={days} />
    </div>
  );
}
