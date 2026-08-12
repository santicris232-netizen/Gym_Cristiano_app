import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión — Gym Cristiano" };

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-1 font-display text-xl tracking-wide text-cream">
        Iniciar sesión
      </h2>
      <p className="mb-6 text-sm text-cream-dim">
        Entra para ver tu semana de entreno o tu panel de entrenador.
      </p>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-cream-dim">
        ¿Primera vez por acá?{" "}
        <Link
          href="/registro"
          className="font-semibold text-neon-blue hover:underline"
        >
          Crea tu cuenta
        </Link>
      </p>

      <div className="mt-6 rounded-md border border-line/70 bg-surface-2/60 p-3 font-mono text-[11px] leading-relaxed text-cream-dim">
        <p className="mb-1 text-neon-gold">Cuentas demo</p>
        <p>Entrenador: trainer@gymcristiano.app / Entrenador123!</p>
        <p>Alumno: alumno1@gymcristiano.app / Alumno123!</p>
      </div>
    </>
  );
}
