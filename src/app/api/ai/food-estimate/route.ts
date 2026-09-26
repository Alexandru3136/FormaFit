import { NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/server/ai-json";
import { db } from "@/lib/server/db";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { rateLimit } from "@/lib/server/rate-limit";
import { getCurrentUser } from "@/lib/server/session";

export async function POST(request: Request) {
  const blocked = await rateLimit({ key: "ai-food-estimate", limit: 10, windowSeconds: 60 });
  if (blocked) return blocked;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: { mealText?: unknown };

  try {
    body = (await request.json()) as { mealText?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const mealText = typeof body.mealText === "string" ? body.mealText.trim() : "";

  if (mealText.length < 3 || mealText.length > 1000) {
    return NextResponse.json(
      { error: "Meal text must be between 3 and 1000 characters." },
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
      { error: "Completeaza profilul inainte sa estimezi mesele." },
      { status: 428 },
    );
  }

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You estimate calories and macros from a Romanian meal description. Return only valid JSON with keys: mealType, confidence, notes, items, totals. items must contain name, portion, calories, proteinGrams, carbGrams, fatGrams. totals must contain calories, proteinGrams, carbGrams, fatGrams. Be conservative and label uncertainty.",
        },
        {
          role: "user",
          content: JSON.stringify({
            mealText,
            profile: {
              activityLevel: profile.activityLevel,
              age: profile.age,
              goal: profile.goal,
              heightCm: profile.heightCm,
              restrictions: profile.restrictions,
              sex: profile.sex,
              weightKg: profile.weightKg,
            },
          }),
        },
      ],
      temperature: 0.1,
    });

    return NextResponse.json({ estimate: extractJsonObject(answer) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown food estimate error." },
      { status: 502 },
    );
  }
}
