"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type ApiState = {
  error: string;
  isLoading: boolean;
  result: unknown;
};

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

type FoodPhotoItem = {
  calories?: unknown;
  carbGrams?: unknown;
  fatGrams?: unknown;
  name?: unknown;
  portion?: unknown;
  proteinGrams?: unknown;
};

type ConfirmedFoodPhotoItem = {
  originalName: string;
  selectedFood: string;
  grams: number;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  locked: boolean;
};

type FoodPhotoEstimate = {
  confidence?: unknown;
  items?: unknown;
  notes?: unknown;
  totals?: {
    calories?: unknown;
    carbGrams?: unknown;
    fatGrams?: unknown;
    proteinGrams?: unknown;
  };
};

type NotificationTemplate = {
  body?: unknown;
  timing?: unknown;
  title?: unknown;
  tone?: unknown;
};

type ActiveMealPlan = {
  daysCount: number;
  endsAt: string;
  id: string;
  ingredients: string;
  plan: unknown;
  startsAt: string;
  status: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asStringList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter((item) => item.trim().length > 0)
    : [];
}

const foodMacrosPer100g: Record<
  string,
  { calories: number; carbGrams: number; fatGrams: number; proteinGrams: number }
> = {
  carrot: { calories: 35, carbGrams: 8, fatGrams: 0.2, proteinGrams: 0.8 },
  mushrooms: { calories: 28, carbGrams: 4, fatGrams: 0.4, proteinGrams: 3.5 },
  pasta: { calories: 150, carbGrams: 30, fatGrams: 1.1, proteinGrams: 5.8 },
  peas: { calories: 84, carbGrams: 14, fatGrams: 0.4, proteinGrams: 5.4 },
  potato: { calories: 87, carbGrams: 20, fatGrams: 0.1, proteinGrams: 1.9 },
  zucchini: { calories: 20, carbGrams: 3.1, fatGrams: 0.4, proteinGrams: 1.2 },
};

function parseGrams(portion: unknown) {
  const match = typeof portion === "string" ? portion.match(/(\d+(?:[.,]\d+)?)/) : null;
  if (!match) return 100;
  return Math.max(1, Math.round(Number(match[1].replace(",", "."))));
}

function detectFoodKey(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("mazare") || normalized.includes("mazăre")) return "peas";
  if (normalized.includes("ciuper")) return "mushrooms";
  if (normalized.includes("morcov")) return "carrot";
  if (normalized.includes("dovle")) return "zucchini";
  if (normalized.includes("cartof")) return "potato";
  if (normalized.includes("paste") || normalized.includes("fusilli")) return "pasta";
  return "unknown";
}

function calculateConfirmedItem(item: ConfirmedFoodPhotoItem) {
  const macro = foodMacrosPer100g[item.selectedFood];
  if (!macro) return item;

  const multiplier = item.grams / 100;
  return {
    ...item,
    calories: Math.round(macro.calories * multiplier),
    carbGrams: Math.round(macro.carbGrams * multiplier * 10) / 10,
    fatGrams: Math.round(macro.fatGrams * multiplier * 10) / 10,
    proteinGrams: Math.round(macro.proteinGrams * multiplier * 10) / 10,
  };
}

function PremiumTool({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ResultBox({ state }: { state: ApiState }) {
  if (state.error) {
    return (
      <p className="mt-3 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-3 text-sm font-semibold leading-6 text-[#5d531c]">
        {state.error}
      </p>
    );
  }

  if (!state.result || typeof state.result !== "string") return null;

  return (
    <div className="mt-3 whitespace-pre-wrap rounded-lg bg-[#fbfaf4] p-4 text-sm font-semibold leading-6 text-[#384034]">
      {state.result}
    </div>
  );
}

function MealPlanResult({ state }: { state: ApiState }) {
  const t = useTranslations("premiumHub");
  if (state.error) return <ResultBox state={state} />;
  const result = asRecord(state.result);
  const days = Array.isArray(result.days) ? (result.days as MealPlanDay[]) : [];

  if (days.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3">
      {days.map((day, dayIndex) => {
        const meals = Array.isArray(day.meals) ? (day.meals as MealPlanMeal[]) : [];

        return (
          <article className="rounded-lg bg-[#fbfaf4] p-4" key={`${asText(day.label)}-${dayIndex}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#527b20]">
                  {asText(day.label, t("dayNumber", { number: dayIndex + 1 }))}
                </p>
                <h3 className="mt-2 text-2xl font-black">
                  {asNumber(day.calories)} kcal
                </h3>
              </div>
              <span className="rounded-md bg-[#c8ff55] px-3 py-2 text-sm font-black">
                {t("proteinG", { grams: asNumber(day.proteinGrams) })}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {meals.map((meal, mealIndex) => (
                <div className="rounded-lg border border-[#e6e1d1] bg-white p-3" key={mealIndex}>
                  <h4 className="font-black">{asText(meal.name, t("mealNumber", { number: mealIndex + 1 }))}</h4>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#555d52]">
                    {asStringList(meal.ingredients).join(", ")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#656b62]">
                    {asText(meal.notes, t("mealNotesFallback"))}
                  </p>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ActiveMealPlanSummary({ activePlan }: { activePlan: ActiveMealPlan | null }) {
  const t = useTranslations("premiumHub");
  const locale = useLocale();
  if (!activePlan) {
    return (
      <div className="rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-4">
        <p className="text-sm font-black text-[#527b20]">{t("activePlan")}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#62695f]">
          {t("noActivePlan")}
        </p>
      </div>
    );
  }

  const plan = asRecord(activePlan.plan);
  const days = Array.isArray(plan.days) ? (plan.days as MealPlanDay[]) : [];
  const firstDay = days[0];

  return (
    <div className="rounded-lg bg-[#111317] p-4 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#c8ff55]">{t("activePlan")}</p>
          <h3 className="mt-2 text-2xl font-black">{t("daysCount", { count: activePlan.daysCount })}</h3>
        </div>
        <span className="rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-black text-[#c8ff55]">
          {t("untilDate", { date: new Date(activePlan.endsAt).toLocaleDateString(locale) })}
        </span>
      </div>
      {firstDay ? (
        <div className="mt-4 rounded-lg bg-white/[0.07] p-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff55]">
            {t("todayInPlan")}
          </p>
          <p className="mt-2 text-lg font-black">{asText(firstDay.label, t("day1"))}</p>
          <p className="mt-1 text-sm font-semibold text-[#d9dfd3]">
            {t("kcalProtein", { calories: asNumber(firstDay.calories), protein: asNumber(firstDay.proteinGrams) })}
          </p>
        </div>
      ) : null}
      {activePlan.ingredients ? (
        <p className="mt-3 text-sm font-semibold leading-6 text-[#d9dfd3]">
          {t("preferences", { items: activePlan.ingredients })}
        </p>
      ) : null}
    </div>
  );
}

function FoodPhotoResult({ state }: { state: ApiState }) {
  const t = useTranslations("premiumHub");
  const tf = useTranslations("foods");
  const estimate = asRecord(state.result) as FoodPhotoEstimate;
  const items = useMemo(
    () => (Array.isArray(estimate.items) ? (estimate.items as FoodPhotoItem[]) : []),
    [estimate.items],
  );
  const [confirmedItems, setConfirmedItems] = useState<ConfirmedFoodPhotoItem[]>([]);

  useEffect(() => {
    const nextItems = items.map((item) => {
      const name = asText(item.name, t("unclearComponent"));
      const foodKey = detectFoodKey(name);
      const grams = parseGrams(item.portion);
      const locked = foodKey !== "unknown" && !name.toLowerCase().includes("neclar");
      const baseItem = {
        calories: asNumber(item.calories),
        carbGrams: asNumber(item.carbGrams),
        fatGrams: asNumber(item.fatGrams),
        grams,
        locked,
        originalName: name,
        proteinGrams: asNumber(item.proteinGrams),
        selectedFood: foodKey,
      };

      return locked ? baseItem : calculateConfirmedItem(baseItem);
    });

    queueMicrotask(() => setConfirmedItems(nextItems));
  }, [items, t]);

  const confirmedTotals = useMemo(
    () =>
      confirmedItems.reduce(
        (sum, item) => ({
          calories: sum.calories + item.calories,
          carbGrams: Math.round((sum.carbGrams + item.carbGrams) * 10) / 10,
          fatGrams: Math.round((sum.fatGrams + item.fatGrams) * 10) / 10,
          proteinGrams: Math.round((sum.proteinGrams + item.proteinGrams) * 10) / 10,
        }),
        { calories: 0, carbGrams: 0, fatGrams: 0, proteinGrams: 0 },
      ),
    [confirmedItems],
  );

  function updateConfirmedItem(index: number, patch: Partial<ConfirmedFoodPhotoItem>) {
    setConfirmedItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return calculateConfirmedItem({ ...item, ...patch });
      }),
    );
  }

  if (state.error) return <ResultBox state={state} />;
  if (items.length === 0 && !estimate.totals) return null;

  return (
    <div className="mt-4 rounded-lg bg-[#fbfaf4] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#527b20]">
            {t("estimateTitle")}
          </p>
          <h3 className="mt-2 text-3xl font-black">
            {confirmedTotals.calories || asNumber(estimate.totals?.calories)} kcal
          </h3>
        </div>
        <span className="rounded-md bg-[#15171d] px-3 py-2 text-sm font-black text-white">
          {t("afterConfirm")}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs font-black text-[#62695f]">{t("protein")}</p>
          <p className="mt-1 text-xl font-black">
            {confirmedTotals.proteinGrams || asNumber(estimate.totals?.proteinGrams)}g
          </p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs font-black text-[#62695f]">{t("carbs")}</p>
          <p className="mt-1 text-xl font-black">
            {confirmedTotals.carbGrams || asNumber(estimate.totals?.carbGrams)}g
          </p>
        </div>
        <div className="rounded-lg bg-white p-3">
          <p className="text-xs font-black text-[#62695f]">{t("fat")}</p>
          <p className="mt-1 text-xl font-black">
            {confirmedTotals.fatGrams || asNumber(estimate.totals?.fatGrams)}g
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {confirmedItems.map((item, index) => (
          <div className="rounded-lg border border-[#e6e1d1] bg-white p-3" key={index}>
            <div className="flex flex-wrap justify-between gap-2">
              <h4 className="font-black">
                {foodMacrosPer100g[item.selectedFood] ? tf(item.selectedFood) : item.originalName}
              </h4>
              <span className="text-sm font-black text-[#527b20]">
                {item.calories} kcal
              </span>
            </div>
            {item.locked ? (
              <p className="mt-1 text-sm font-semibold text-[#62695f]">
                {t("gramsProtein", { grams: item.grams, protein: item.proteinGrams })}
              </p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px]">
                <select
                  className="h-11 rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-3 text-sm font-black"
                  onChange={(event) =>
                    updateConfirmedItem(index, { selectedFood: event.target.value })
                  }
                  value={item.selectedFood}
                >
                  <option value="unknown">{t("chooseIngredient")}</option>
                  {Object.keys(foodMacrosPer100g).map((key) => (
                    <option key={key} value={key}>
                      {tf(key)}
                    </option>
                  ))}
                </select>
                <input
                  className="h-11 rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-3 text-sm font-black"
                  min={1}
                  onChange={(event) =>
                    updateConfirmedItem(index, { grams: Number(event.target.value) })
                  }
                  type="number"
                  value={item.grams}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-3 text-sm font-semibold leading-6 text-[#5d531c]">
        {asText(estimate.notes, t("photoNotesFallback"))}
      </p>
    </div>
  );
}

function NotificationsResult({ state }: { state: ApiState }) {
  const t = useTranslations("premiumHub");
  if (state.error) return <ResultBox state={state} />;
  const result = asRecord(state.result);
  const notifications = Array.isArray(result.notifications)
    ? (result.notifications as NotificationTemplate[])
    : [];

  if (notifications.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3">
      {notifications.map((notification, index) => (
        <article className="rounded-lg bg-[#fbfaf4] p-4" key={index}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#c8ff55] px-2 py-1 text-xs font-black">
              {asText(notification.timing, t("notifMomentFallback"))}
            </span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
              {asText(notification.tone, t("notifToneFallback"))}
            </span>
          </div>
          <h3 className="mt-3 font-black">{asText(notification.title, t("notifTitleFallback"))}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#555d52]">
            {asText(notification.body)}
          </p>
        </article>
      ))}
    </div>
  );
}

export function PremiumHub() {
  const t = useTranslations("premiumHub");
  const [coachMessage, setCoachMessage] = useState("");
  const [mealIngredients, setMealIngredients] = useState("");
  const [mealDays, setMealDays] = useState(3);
  const [photoNote, setPhotoNote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [coachState, setCoachState] = useState<ApiState>({ error: "", isLoading: false, result: null });
  const [mealState, setMealState] = useState<ApiState>({ error: "", isLoading: false, result: null });
  const [reportState, setReportState] = useState<ApiState>({ error: "", isLoading: false, result: null });
  const [photoState, setPhotoState] = useState<ApiState>({ error: "", isLoading: false, result: null });
  const [notificationState, setNotificationState] = useState<ApiState>({
    error: "",
    isLoading: false,
    result: null,
  });
  const [activeMealPlan, setActiveMealPlan] = useState<ActiveMealPlan | null>(null);
  const [mealPlanStatus, setMealPlanStatus] = useState("");
  const [isSavingMealPlan, setIsSavingMealPlan] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadActiveMealPlan() {
      try {
        const response = await fetch("/api/premium/meal-plan");
        const payload = (await response.json()) as { activePlan?: ActiveMealPlan | null };

        if (isMounted) {
          setActiveMealPlan(payload.activePlan ?? null);
        }
      } catch {
        if (isMounted) {
          setActiveMealPlan(null);
        }
      }
    }

    void loadActiveMealPlan();

    return () => {
      isMounted = false;
    };
  }, []);

  async function runJsonTool(
    endpoint: string,
    setter: React.Dispatch<React.SetStateAction<ApiState>>,
    body?: unknown,
  ) {
    setter({ error: "", isLoading: true, result: null });

    try {
      const response = await fetch(endpoint, {
        body: body ? JSON.stringify(body) : undefined,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        method: body ? "POST" : "GET",
      });
      const payload = (await response.json()) as { answer?: string; error?: string; report?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? t("notResponded"));
      }

      setter({
        error: "",
        isLoading: false,
        result: payload.answer ?? payload.report ?? payload,
      });
    } catch (error) {
      setter({
        error: error instanceof Error ? error.message : t("unknownError"),
        isLoading: false,
        result: null,
      });
    }
  }

  async function analyzePhoto() {
    if (!photoFile) return;
    setPhotoState({ error: "", isLoading: true, result: null });

    try {
      const formData = new FormData();
      formData.set("image", photoFile);
      formData.set("note", photoNote);

      const response = await fetch("/api/premium/food-photo", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string; estimate?: unknown };

      if (!response.ok) {
        throw new Error(payload.error ?? t("photoNotResponded"));
      }

      setPhotoState({ error: "", isLoading: false, result: payload.estimate ?? null });
    } catch (error) {
      setPhotoState({
        error: error instanceof Error ? error.message : t("unknownError"),
        isLoading: false,
        result: null,
      });
    }
  }

  async function saveMealPlan() {
    const generatedPlan = mealState.result;
    const plan = asRecord(generatedPlan);

    if (!Array.isArray(plan.days) || isSavingMealPlan) return;

    setIsSavingMealPlan(true);
    setMealPlanStatus(t("savingPlan"));

    try {
      const response = await fetch("/api/premium/meal-plan", {
        body: JSON.stringify({
          days: mealDays,
          ingredients: mealIngredients,
          plan: generatedPlan,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
      const payload = (await response.json()) as { activePlan?: ActiveMealPlan | null; error?: string };

      if (!response.ok || !payload.activePlan) {
        throw new Error(payload.error ?? t("cannotSavePlan"));
      }

      setActiveMealPlan(payload.activePlan);
      setMealPlanStatus(t("planSaved"));
    } catch (error) {
      setMealPlanStatus(error instanceof Error ? error.message : t("unknownError"));
    } finally {
      setIsSavingMealPlan(false);
    }
  }

  return (
    <div className="grid gap-4">
      <PremiumTool title={t("coachTitle")}>
        <textarea
          className="min-h-28 w-full resize-none rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-4 text-sm font-semibold leading-6 outline-none focus:border-[#123f31]"
          onChange={(event) => setCoachMessage(event.target.value)}
          placeholder={t("coachPlaceholder")}
          value={coachMessage}
        />
        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          disabled={coachMessage.trim().length < 2 || coachState.isLoading}
          onClick={() =>
            runJsonTool("/api/premium/coach", setCoachState, { message: coachMessage })
          }
          type="button"
        >
          {coachState.isLoading ? t("coachLoading") : t("coachBtn")}
        </button>
        <ResultBox state={coachState} />
      </PremiumTool>

      <PremiumTool title={t("mealTitle")}>
        <ActiveMealPlanSummary activePlan={activeMealPlan} />
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <select
            className="h-12 rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-sm font-black"
            onChange={(event) => setMealDays(Number(event.target.value))}
            value={mealDays}
          >
            <option value={3}>{t("days3")}</option>
            <option value={7}>{t("days7")}</option>
          </select>
          <input
            className="h-12 rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-sm font-semibold outline-none focus:border-[#123f31]"
            onChange={(event) => setMealIngredients(event.target.value)}
            placeholder={t("ingredientsPlaceholder")}
            value={mealIngredients}
          />
        </div>
        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          disabled={mealState.isLoading}
          onClick={() =>
            runJsonTool("/api/premium/meal-plan", setMealState, {
              days: mealDays,
              ingredients: mealIngredients,
            })
          }
          type="button"
        >
          {mealState.isLoading ? t("genLoading") : t("genBtn")}
        </button>
        {Array.isArray(asRecord(mealState.result).days) ? (
          <button
            className="mt-3 min-h-12 w-full rounded-lg bg-[#c8ff55] px-4 py-3 text-sm font-black text-[#101211] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSavingMealPlan}
            onClick={saveMealPlan}
            type="button"
          >
            {isSavingMealPlan ? t("saveLoading") : t("saveBtn")}
          </button>
        ) : null}
        {mealPlanStatus ? (
          <p className="mt-3 rounded-lg bg-[#fbfaf4] p-3 text-sm font-semibold text-[#62695f]">
            {mealPlanStatus}
          </p>
        ) : null}
        <MealPlanResult state={mealState} />
      </PremiumTool>

      <div className="grid gap-4 lg:grid-cols-2">
        <PremiumTool title={t("reportTitle")}>
          <button
            className="min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            disabled={reportState.isLoading}
            onClick={() => runJsonTool("/api/premium/report", setReportState)}
            type="button"
          >
            {reportState.isLoading ? t("reportLoading") : t("reportBtn")}
          </button>
          <ResultBox state={reportState} />
        </PremiumTool>

        <PremiumTool title={t("notifTitle")}>
          <button
            className="min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
            disabled={notificationState.isLoading}
            onClick={() =>
              runJsonTool("/api/premium/notifications", setNotificationState, {})
            }
            type="button"
          >
            {notificationState.isLoading ? t("notifLoading") : t("notifBtn")}
          </button>
          <NotificationsResult state={notificationState} />
        </PremiumTool>
      </div>

      <PremiumTool title={t("photoTitle")}>
        <div className="grid gap-3">
          <label className="cursor-pointer rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-3 text-sm font-black">
            {photoFile ? photoFile.name : t("choosePhoto")}
            <input
            accept="image/*"
            className="sr-only"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            type="file"
            />
          </label>
          <input
            className="h-12 rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-sm font-semibold outline-none focus:border-[#123f31]"
            onChange={(event) => setPhotoNote(event.target.value)}
            placeholder={t("photoNotePlaceholder")}
            value={photoNote}
          />
          <p className="text-sm font-semibold leading-6 text-[#62695f]">
            {t("photoHelp")}
          </p>
        </div>
        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          disabled={!photoFile || photoState.isLoading}
          onClick={analyzePhoto}
          type="button"
        >
          {photoState.isLoading ? t("photoLoading") : t("photoBtn")}
        </button>
        <FoodPhotoResult state={photoState} />
      </PremiumTool>
    </div>
  );
}
