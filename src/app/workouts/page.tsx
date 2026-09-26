import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { WorkoutBrowser } from "@/features/workouts/workout-browser";
import { buildWorkoutPlan } from "@/features/workouts/workout-planner";
import { db } from "@/lib/server/db";
import { toUserProfile } from "@/lib/server/profile";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function WorkoutsPage() {
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

  const profile = userWithProfile ? toUserProfile(userWithProfile) : null;

  if (!profile) {
    redirect("/onboarding");
  }

  const workoutPlan = buildWorkoutPlan(profile);
  const tp = await getTranslations("pages");

  return (
    <AppShell kicker={tp("workoutsKicker")} title={tp("workoutsTitle")}>
      <WorkoutBrowser plan={workoutPlan} trainingDaysPerWeek={profile.trainingDaysPerWeek} />
    </AppShell>
  );
}
