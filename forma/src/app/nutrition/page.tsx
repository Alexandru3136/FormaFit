import { AppShell } from "@/components/app-shell";
import { FoodLogPanel } from "@/features/food-log/food-log-panel";
import { MealIdeasPanel } from "@/features/nutrition/meal-ideas-panel";
import { db } from "@/lib/server/db";
import { toUserProfile } from "@/lib/server/profile";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function NutritionPage() {
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

  return (
    <AppShell kicker="nutritie" title="Mese si calorii">
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#d6c981] bg-[#fff7cc] p-4 text-sm font-semibold leading-6 text-[#5d531c]">
          Estimarile de calorii si macro-uri sunt orientative. Forma nu inlocuieste
          un medic, nutritionist sau antrenor calificat.
        </div>

        <FoodLogPanel />
        <MealIdeasPanel />
      </div>
    </AppShell>
  );
}
