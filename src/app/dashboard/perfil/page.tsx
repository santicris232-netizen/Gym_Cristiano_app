import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { WeightUnitToggle } from "@/components/user/WeightUnitToggle";

export const metadata: Metadata = { title: "Perfil — Gym Cristiano" };

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">
          Perfil
        </p>
        <h1 className="font-display text-3xl tracking-wide text-cream">
          {user.name}
        </h1>
        <p className="font-mono text-sm text-cream-dim">{user.email}</p>
      </header>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-1 font-display text-lg tracking-wide text-cream">
          Unidad de peso
        </h2>
        <p className="mb-4 text-sm text-cream-dim">
          Se usa en el contador de series y en tu historial de entrenos.
        </p>
        <WeightUnitToggle initialUnit={user.weightUnit} />
      </div>
    </div>
  );
}
