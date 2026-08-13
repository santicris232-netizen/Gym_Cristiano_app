import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { UserSummary } from "../../types";

function lastTrainedStatus(lastTrainedAt: string | null): {
  label: string;
  tone: "blue" | "gold" | "neutral" | "red";
} {
  if (!lastTrainedAt) return { label: "Sin entrenos aún", tone: "red" };
  const days = Math.floor((Date.now() - new Date(lastTrainedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return { label: "Entrenó hoy", tone: "blue" };
  if (days === 1) return { label: "Entrenó ayer", tone: "blue" };
  if (days <= 7) return { label: `Hace ${days} días`, tone: "gold" };
  return { label: `Hace ${days} días`, tone: "neutral" };
}

export function UserListItem({ user }: { user: UserSummary }) {
  const status = lastTrainedStatus(user.last_trained_at);
  return (
    <Link to={`/trainer/users/${user.id}`}>
      <Card className="flex items-center justify-between gap-3 p-4 transition hover:border-neon-blue/50 hover:shadow-neon">
        <div className="min-w-0">
          <p className="truncate font-semibold text-cream">{user.name}</p>
          <p className="truncate font-mono text-xs text-cream-dim">{user.email}</p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </Card>
    </Link>
  );
}
