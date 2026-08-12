"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { WEIGHT_UNIT_OPTIONS } from "@/lib/units";
import type { WeightUnit } from "@/generated/prisma/client";

interface CreatedUser {
  id: string;
  name: string;
  email: string;
}

export function AddUserForm({
  onCreated,
}: {
  onCreated: (user: CreatedUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("KG");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, weightUnit }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el alumno.");
        return;
      }
      onCreated(data.user);
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-name">Nombre</Label>
          <Input
            id="new-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="new-email">Email</Label>
          <Input
            id="new-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="new-password">Contraseña inicial</Label>
          <Input
            id="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div>
          <Label>Unidad de peso</Label>
          <div className="flex gap-2">
            {WEIGHT_UNIT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWeightUnit(opt.value)}
                className={`flex-1 rounded-md border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition ${
                  weightUnit === opt.value
                    ? "border-neon-blue text-neon-blue shadow-neon"
                    : "border-line text-cream-dim hover:text-cream"
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear alumno"}
          </Button>
          <FieldError>{error}</FieldError>
        </div>
      </form>
    </Card>
  );
}
