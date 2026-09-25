import { getTranslations } from "next-intl/server";
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

  const tp = await getTranslations("pages");
  const t = await getTranslations("nutritionPage");

  return (
    <AppShell kicker={tp("nutritionKicker")} title={tp("nutritionTitle")}>
      <div className="grid gap-4">
        <div className="rounded-lg border border-[#d6c981] bg-[#fff7cc] p-4 text-sm font-semibold leading-6 text-[#5d531c]">
          {t("disclaimer")}
        </div>

        <FoodLogPanel />
        <MealIdeasPanel />
      </div>
    </AppShell>
  );
}
