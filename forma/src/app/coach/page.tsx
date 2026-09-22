import { AppShell } from "@/components/app-shell";
import { CoachPanel } from "@/features/ai/coach-panel";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function CoachPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userWithProfile = await db.user.findUnique({
    include: {
      profile: true,
    },
    where: {
      id: user.id,
    },
  });

  if (!userWithProfile?.profile) {
    redirect("/onboarding");
  }

  return (
    <AppShell kicker="ai coach" title="Coach Forma">
      <CoachPanel />
    </AppShell>
  );
}
