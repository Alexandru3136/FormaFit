import { NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/server/ai-json";
import { hasPremiumAccess } from "@/lib/server/access";
import { db } from "@/lib/server/db";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { rateLimit } from "@/lib/server/rate-limit";
import { getCurrentUser } from "@/lib/server/session";

const freeDailyLimit = 2;
const freeIdeaLimit = 2;
const premiumIdeaLimit = 5;
const mealIdeaAction = "MEAL_IDEAS_GENERATED";

type MealIdea = {
  title: string;
  calories: number;
  proteinGrams: number;
  ingredients: string[];
  steps: string[];
  note: string;
};

function getTodayStart() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return todayStart;
}

async function getMealIdeaQuota(userId: string) {
  const isPremium = await hasPremiumAccess(userId);

  if (isPremium) {
    return {
      isPremium,
      limit: null,
      remaining: null,
      used: 0,
    };
  }

  const used = await db.auditLog.count({
    where: {
      action: mealIdeaAction,
      createdAt: {
        gte: getTodayStart(),
      },
      userId,
    },
  });

  return {
    isPremium,
    limit: freeDailyLimit,
    remaining: Math.max(0, freeDailyLimit - used),
    used,
  };
}

function normalizeIdeas(payload: unknown, limit: number) {
  const ideas = (payload as { ideas?: MealIdea[] }).ideas;

  if (!Array.isArray(ideas)) {
    throw new Error("AI response did not include an ideas array.");
  }

  return ideas.slice(0, limit).map((idea) => ({
    calories: Number(idea.calories ?? 0),
    ingredients: Array.isArray(idea.ingredients) ? idea.ingredients.map(String).slice(0, 8) : [],
    note: String(idea.note ?? "").slice(0, 500),
    proteinGrams: Number(idea.proteinGrams ?? 0),
    steps: Array.isArray(idea.steps) ? idea.steps.map(String).slice(0, 4) : [],
    title: String(idea.title ?? "Idee de masa").slice(0, 120),
  }));
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  return NextResponse.json({ quota: await getMealIdeaQuota(user.id) });
}

export async function POST(request: Request) {
  const blocked = await rateLimit({ key: "ai-meal-ideas", limit: 10, windowSeconds: 60 });
  if (blocked) return blocked;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: { ingredients?: unknown };

  try {
    body = (await request.json()) as { ingredients?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const ingredients = typeof body.ingredients === "string" ? body.ingredients.trim() : "";

  if (ingredients.length < 3 || ingredients.length > 1000) {
    return NextResponse.json(
      { error: "Ingredientele trebuie sa aiba intre 3 si 1000 caractere." },
      { status: 400 },
    );
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Completeaza profilul inainte sa generezi idei de masa." },
      { status: 428 },
    );
  }

  const quota = await getMealIdeaQuota(user.id);

  if (!quota.isPremium && quota.remaining === 0) {
    return NextResponse.json(
      {
        error: "Ai folosit cele 2 generari Free de azi. Premium deblocheaza mai multe generari.",
        quota,
      },
      { status: 429 },
    );
  }

  const ideaLimit = quota.isPremium ? premiumIdeaLimit : freeIdeaLimit;

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            `You are Forma, a Romanian nutrition coach. Generate exactly ${ideaLimit} meal ideas from the available ingredients and the user profile. Return only valid JSON with key ideas. Each idea must include title, calories, proteinGrams, ingredients array, steps array with 2-4 short steps, and note. Keep it practical, non-shaming, and mention uncertainty when needed. Do not provide medical claims.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            ingredients,
            profile: {
              activityLevel: profile.activityLevel,
              age: profile.age,
              foodPreferences: profile.foodPreferences,
              goal: profile.goal,
              restrictions: profile.restrictions,
              sex: profile.sex,
              weightKg: profile.weightKg,
            },
          }),
        },
      ],
      temperature: 0.25,
    });

    const ideas = normalizeIdeas(extractJsonObject(answer), ideaLimit);

    await db.auditLog.create({
      data: {
        action: mealIdeaAction,
        metadata: JSON.stringify({
          ingredients: ingredients.slice(0, 300),
          ideaCount: ideas.length,
          premium: quota.isPremium,
        }),
        userId: user.id,
      },
    });

    return NextResponse.json({ ideas, quota: await getMealIdeaQuota(user.id) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown meal idea error." },
      { status: 502 },
    );
  }
}
