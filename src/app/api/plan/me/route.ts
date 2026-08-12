import { NextResponse } from "next/server";
import { requireUser, withApiErrors } from "@/lib/api-helpers";
import { getWeeklyPlan } from "@/lib/plan";

export async function GET() {
  return withApiErrors(async () => {
    const user = await requireUser();
    const days = await getWeeklyPlan(user.id);
    return NextResponse.json({ days });
  });
}
