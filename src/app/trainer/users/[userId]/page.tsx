import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWeeklyPlan } from "@/lib/plan";
import { UserDetailTabs } from "@/components/trainer/UserDetailTabs";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "USER") notFound();

  const days = await getWeeklyPlan(userId);

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-xs tracking-[0.2em] text-neon-blue uppercase">
          Alumno
        </p>
        <h1 className="font-display text-3xl tracking-wide text-cream">
          {user.name}
        </h1>
        <p className="font-mono text-sm text-cream-dim">
          {user.email} · unidad {user.weightUnit}
        </p>
      </header>
      <UserDetailTabs
        userId={user.id}
        weightUnit={user.weightUnit}
        initialDays={days}
      />
    </div>
  );
}
