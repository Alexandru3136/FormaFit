import { getLocale, getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { MetricTile } from "@/components/metric-tile";
import { calculateTargets } from "@/features/nutrition/calorie-calculator";
import { ProfileSummary } from "@/features/profile/profile-summary";
import { buildWorkoutPlan } from "@/features/workouts/workout-planner";
import { db } from "@/lib/server/db";
import { toUserProfile } from "@/lib/server/profile";
import { getCurrentUser } from "@/lib/server/session";
import Link from "next/link";
import { redirect } from "next/navigation";

type ActiveMealPlanDay = {
  calories?: unknown;
  label?: unknown;
  meals?: unknown;
  proteinGrams?: unknown;
};

type ActiveMealPlanMeal = {
  ingredients?: unknown;
  name?: unknown;
};

function readActiveMealPlanDays(planJson: string): ActiveMealPlanDay[] {
  try {
    const plan = JSON.parse(planJson) as { days?: unknown };
    return Array.isArray(plan.days) ? (plan.days as ActiveMealPlanDay[]) : [];
  } catch {
    return [];
  }
}

function getText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function getNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getTodayWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { end, start };
}

function getWeekStart() {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatPercent(value: number) {
  return `${Math.min(Math.max(Math.round(value), 0), 100)}%`;
}

export default async function DashboardPage() {
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

  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const targets = calculateTargets(profile);
  const { end: todayEnd, start: todayStart } = getTodayWindow();
  const [todayMeals, activeMealPlan, completedWorkoutsThisWeek] = await Promise.all([
    db.mealLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
        userId: user.id,
      },
    }),
    db.mealPlan.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        status: "ACTIVE",
        userId: user.id,
      },
    }),
    db.workoutLog.count({
      where: {
        userId: user.id,
        weekStart: getWeekStart(),
      },
    }),
  ]);
  const consumed = todayMeals.reduce(
    (sum, meal) => ({
      calories: sum.calories + meal.calories,
      carbGrams: sum.carbGrams + meal.carbGrams,
      fatGrams: sum.fatGrams + meal.fatGrams,
      proteinGrams: sum.proteinGrams + meal.proteinGrams,
    }),
    { calories: 0, carbGrams: 0, fatGrams: 0, proteinGrams: 0 },
  );
  const remainingCalories = Math.max(0, targets.calories - consumed.calories);
  const calorieProgress = targets.calories > 0 ? (consumed.calories / targets.calories) * 100 : 0;
  const proteinProgress =
    targets.proteinGrams > 0 ? (consumed.proteinGrams / targets.proteinGrams) * 100 : 0;
  const dailyStats = [
    {
      helper: t("ofKcal", { calories: targets.calories.toLocaleString(locale) }),
      label: t("consumedToday"),
      value: consumed.calories.toLocaleString(locale),
    },
    {
      helper: t("targetProtein", { grams: targets.proteinGrams }),
      label: t("protein"),
      value: `${consumed.proteinGrams}g`,
    },
    {
      helper: t("ofPlanned", { count: profile.trainingDaysPerWeek }),
      label: t("gymWeek"),
      value: String(completedWorkoutsThisWeek),
    },
  ];
  const workoutPlan = buildWorkoutPlan(profile);
  const activeMealPlanDays = activeMealPlan ? readActiveMealPlanDays(activeMealPlan.planJson) : [];

  return (
    <AppShell kicker={t("kicker")} title={t("greeting", { name: user.name })}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {dailyStats.map((stat) => (
            <MetricTile key={stat.label} {...stat} />
          ))}
        </section>

        <ProfileSummary
          consumedCalories={consumed.calories}
          consumedProteinGrams={consumed.proteinGrams}
          profile={profile}
        />
      </div>

      <section className="mt-4 rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
              {t("progressToday")}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {t("kcalLeft", { calories: remainingCalories.toLocaleString(locale) })}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#62695f]">
              {t("savedMeals", {
                meals: todayMeals.length,
                protein: consumed.proteinGrams,
                carbs: consumed.carbGrams,
                fat: consumed.fatGrams,
              })}
            </p>
          </div>
          <Link
            className="min-h-12 rounded-lg bg-[#c8ff55] px-4 py-3 text-center text-sm font-black text-[#101211]"
            href="/nutrition"
          >
            {t("addMeal")}
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
          <div
            className="grid aspect-square place-items-center rounded-full"
            style={{
              background: `conic-gradient(#c8ff55 ${formatPercent(calorieProgress)}, #f0eadb 0)`,
            }}
          >
            <div className="grid h-[72%] w-[72%] place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-3xl font-black">{formatPercent(calorieProgress)}</p>
                <p className="text-xs font-black text-[#62695f]">{t("calories")}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <div className="flex justify-between text-sm font-black">
                <span>{t("calories")}</span>
                <span>{consumed.calories} / {targets.calories}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#f0eadb]">
                <div className="h-full rounded-full bg-[#c8ff55]" style={{ width: formatPercent(calorieProgress) }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-black">
                <span>{t("protein")}</span>
                <span>{consumed.proteinGrams}g / {targets.proteinGrams}g</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#f0eadb]">
                <div className="h-full rounded-full bg-[#123f31]" style={{ width: formatPercent(proteinProgress) }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">
            {activeMealPlan ? t("activeMealPlan") : t("nextMeal")}
          </h2>
          {activeMealPlanDays.length > 0 ? (
            <Link
              className="mt-3 inline-flex rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-3 py-2 text-sm font-black text-[#123f31]"
              href="/meal-plan"
            >
              {t("viewFullPlan")}
            </Link>
          ) : null}
          <div className="mt-4 grid gap-3">
            {activeMealPlanDays.length > 0 ? (
              activeMealPlanDays.slice(0, 2).map((day, index) => {
                const meals = Array.isArray(day.meals)
                  ? (day.meals as ActiveMealPlanMeal[])
                  : [];

                return (
                  <div className="rounded-lg bg-[#fbfaf4] p-4" key={`${getText(day.label, t("dayNumber", { number: index + 1 }))}-${index}`}>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#527b20]">
                      {getText(day.label, t("dayNumber", { number: index + 1 }))}
                    </p>
                    <p className="mt-2 font-black">
                      {t("dayCaloriesProtein", {
                        calories: getNumber(day.calories).toLocaleString(locale),
                        protein: getNumber(day.proteinGrams),
                      })}
                    </p>
                    <p className="mt-2 text-sm text-[#656b62]">
                      {meals
                        .slice(0, 3)
                        .map((meal) => getText(meal.name, t("meal")))
                        .join(" / ")}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg bg-[#fbfaf4] p-4">
                <p className="text-sm font-black text-[#527b20]">{t("noPlan")}</p>
                <p className="mt-2 font-black">{t("generatePremium")}</p>
                <p className="text-sm text-[#656b62]">
                  {t("afterSaving")}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">{t("gymPlan")}</h2>
          <div className="mt-4 grid gap-3">
            {workoutPlan.map((day) => (
              <div className="rounded-lg bg-[#fbfaf4] p-4" key={day.day}>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#527b20]">
                  {day.day}
                </p>
                <p className="mt-1 font-black">{day.focus}</p>
                <p className="text-sm text-[#656b62]">{day.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
