import { getTranslations } from "next-intl/server";
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

  const tp = await getTranslations("pages");

  return (
    <AppShell kicker={tp("coachKicker")} title={tp("coachTitle")}>
      <CoachPanel />
    </AppShell>
  );
}
