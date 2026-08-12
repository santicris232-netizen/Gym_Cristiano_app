import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";
import { NavBar } from "@/components/layout/NavBar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "USER") redirect("/login");

  return (
    <div className="min-h-screen">
      <NavBar role="USER" name={user.name} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
