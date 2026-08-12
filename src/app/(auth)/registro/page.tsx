import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta — Gym Cristiano" };

export default function RegistroPage() {
  return (
    <>
      <h2 className="mb-1 font-display text-xl tracking-wide text-cream">
        Crear cuenta
      </h2>
      <p className="mb-6 text-sm text-cream-dim">
        Date de alta como alumno y tu entrenador te verá en su panel al
        instante.
      </p>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-cream-dim">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-neon-blue hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
