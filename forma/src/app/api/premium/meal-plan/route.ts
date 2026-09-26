import { NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/server/ai-json";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { db } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rate-limit";
import { getPremiumContext } from "@/lib/server/premium";

type MealPlanBody = {
  days?: unknown;
  ingredients?: unknown;
  plan?: unknown;
};

function getPlanWindow(daysCount: number) {
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + daysCount);
  return { endsAt, startsAt };
}

function mapMealPlan(plan: {
  daysCount: number;
  endsAt: Date;
  id: string;
  ingredients: string;
  planJson: string;
  startsAt: Date;
  status: string;
}) {
  return {
    daysCount: plan.daysCount,
    endsAt: plan.endsAt.toISOString(),
    id: plan.id,
    ingredients: plan.ingredients,
    plan: JSON.parse(plan.planJson) as unknown,
    startsAt: plan.startsAt.toISOString(),
    status: plan.status,
  };
}

export async function GET() {
  const context = await getPremiumContext();
  if (context.error) return context.error;

  const activePlan = await db.mealPlan.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      status: "ACTIVE",
      userId: context.user.id,
    },
  });

  return NextResponse.json({ activePlan: activePlan ? mapMealPlan(activePlan) : null });
}

export async function POST(request: Request) {
  const blocked = await rateLimit({ key: "premium-meal-plan", limit: 5, windowSeconds: 60 });
  if (blocked) return blocked;

  const context = await getPremiumContext();
  if (context.error) return context.error;

  let body: MealPlanBody;

  try {
    body = (await request.json()) as { days?: unknown; ingredients?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const days = Number(body.days) === 7 ? 7 : 3;
  const ingredients =
    typeof body.ingredients === "string" ? body.ingredients.trim().slice(0, 1000) : "";

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You are Forma Premium. Create a Romanian meal plan. Return only valid JSON with key days. Each day must include label, calories, proteinGrams, meals array. Each meal includes name, ingredients array, notes. Keep it realistic and aligned with profile, restrictions, and goal.",
        },
        {
          role: "user",
          content: JSON.stringify({
            availableIngredients: ingredients,
            days,
            profile: context.profile,
          }),
        },
      ],
      temperature: 0.25,
    });

    return NextResponse.json(extractJsonObject(answer));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown meal plan error." },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request) {
  const context = await getPremiumContext();
  if (context.error) return context.error;

  let body: MealPlanBody;

  try {
    body = (await request.json()) as MealPlanBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const daysCount = Number(body.days) === 7 ? 7 : 3;
  const ingredients =
    typeof body.ingredients === "string" ? body.ingredients.trim().slice(0, 1000) : "";
  const plan = body.plan;
  const planRecord = plan !== null && typeof plan === "object" ? (plan as { days?: unknown }) : null;

  if (!planRecord || !Array.isArray(planRecord.days) || planRecord.days.length === 0) {
    return NextResponse.json({ error: "Planul alimentar nu este valid." }, { status: 400 });
  }

  const { endsAt, startsAt } = getPlanWindow(daysCount);

  await db.$transaction([
    db.mealPlan.updateMany({
      data: {
        status: "ARCHIVED",
      },
      where: {
        status: "ACTIVE",
        userId: context.user.id,
      },
    }),
    db.mealPlan.create({
      data: {
        daysCount,
        endsAt,
        ingredients,
        planJson: JSON.stringify(plan),
        startsAt,
        status: "ACTIVE",
        userId: context.user.id,
      },
    }),
  ]);

  const activePlan = await db.mealPlan.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      status: "ACTIVE",
      userId: context.user.id,
    },
  });

  return NextResponse.json({ activePlan: activePlan ? mapMealPlan(activePlan) : null });
}
