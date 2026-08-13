import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { UserList } from "../components/trainer/UserList";
import { Spinner } from "../components/ui/Spinner";
import type { UserSummary } from "../types";

export function TrainerHomePage() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get<UserSummary[]>("/users")
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch(() => {
        if (active) setUsers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">
          Panel del entrenador
        </p>
        <h1 className="font-display text-3xl tracking-wide text-cream">Tus alumnos</h1>
      </header>

      {users === null ? (
        <div className="flex justify-center py-10 text-cream-dim">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <UserList initialUsers={users} />
      )}
    </div>
  );
}
