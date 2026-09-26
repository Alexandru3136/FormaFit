import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

type MealPlanMeal = {
  ingredients?: unknown;
  name?: unknown;
  notes?: unknown;
};

type MealPlanDay = {
  calories?: unknown;
  label?: unknown;
  meals?: unknown;
  proteinGrams?: unknown;
};

function readPlanDays(planJson: string): MealPlanDay[] {
  try {
    const plan = JSON.parse(planJson) as { days?: unknown };
    return Array.isArray(plan.days) ? (plan.days as MealPlanDay[]) : [];
  } catch {
    return [];
  }
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function number(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function ingredients(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter((item) => item.trim().length > 0)
    : [];
}

export default async function MealPlanPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const activePlan = await db.mealPlan.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      status: "ACTIVE",
      userId: user.id,
    },
  });
  const days = activePlan ? readPlanDays(activePlan.planJson) : [];
  const tp = await getTranslations("pages");
  const t = await getTranslations("mealPlan");
  const locale = await getLocale();

  return (
    <AppShell kicker={tp("mealPlanKicker")} title={tp("mealPlanTitle")}>
      {!activePlan || days.length === 0 ? (
        <section className="rounded-lg border border-[#ded9c8] bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#527b20]">
            {t("noPlanKicker")}
          </p>
          <h2 className="mt-3 text-3xl font-black">{t("noPlanTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#62695f]">
            {t("noPlanBody")}
          </p>
          <Link
            className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white"
            href="/premium"
          >
            {t("goPremium")}
          </Link>
        </section>
      ) : (
        <div className="grid gap-4">
          <section className="rounded-lg bg-[#111317] p-5 text-white shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#c8ff55]">{t("activePlan")}</p>
                <h2 className="mt-2 text-3xl font-black">{t("daysCount", { count: activePlan.daysCount })}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#d9dfd3]">
                  {t("validUntil", { date: activePlan.endsAt.toLocaleDateString(locale) })}
                </p>
              </div>
              <Link
                className="w-fit rounded-lg bg-[#c8ff55] px-4 py-3 text-sm font-black text-[#101211]"
                href="/premium"
              >
                {t("generateAnother")}
              </Link>
            </div>
          </section>

          <section className="grid gap-4">
            {days.map((day, index) => {
              const meals = Array.isArray(day.meals) ? (day.meals as MealPlanMeal[]) : [];

              return (
                <article
                  className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm"
                  key={`${text(day.label, t("dayNumber", { number: index + 1 }))}-${index}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
                        {text(day.label, t("dayNumber", { number: index + 1 }))}
                      </p>
                      <h3 className="mt-2 text-2xl font-black">
                        {t("kcal", { calories: number(day.calories).toLocaleString(locale) })}
                      </h3>
                    </div>
                    <span className="w-fit rounded-lg bg-[#c8ff55] px-3 py-2 text-sm font-black text-[#101211]">
                      {t("proteinGrams", { grams: number(day.proteinGrams) })}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    {meals.map((meal, mealIndex) => (
                      <div
                        className="rounded-lg border border-[#e6e1d1] bg-[#fbfaf4] p-4"
                        key={mealIndex}
                      >
                        <h4 className="font-black">{text(meal.name, t("mealNumber", { number: mealIndex + 1 }))}</h4>
                        <p className="mt-3 text-sm font-semibold leading-6 text-[#555d52]">
                          {ingredients(meal.ingredients).join(", ")}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#656b62]">
                          {text(meal.notes, t("notesFallback"))}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      )}
    </AppShell>
  );
}
