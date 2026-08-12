import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.role === "TRAINER" ? "/trainer" : "/dashboard");
}
