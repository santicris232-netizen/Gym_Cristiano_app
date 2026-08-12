"use client";

import { useMemo, useState } from "react";
import { UserListItem } from "@/components/trainer/UserListItem";
import { AddUserForm } from "@/components/trainer/AddUserForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { UserSummaryDTO } from "@/types";

export function UserList({
  initialUsers,
}: {
  initialUsers: UserSummaryDTO[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar alumno por nombre o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdd((s) => !s)}
        >
          {showAdd ? "Cancelar" : "+ Agregar alumno"}
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6">
          <AddUserForm
            onCreated={(user) => {
              setUsers((prev) =>
                [
                  ...prev,
                  {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    lastTrainedAt: null,
                  },
                ].sort((a, b) => a.name.localeCompare(b.name)),
              );
              setShowAdd(false);
            }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-cream-dim">
          {users.length === 0
            ? "Todavía no tenés alumnos. Agregá uno o esperá a que se registren."
            : "No hay alumnos que coincidan con tu búsqueda."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((u) => (
            <UserListItem key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
