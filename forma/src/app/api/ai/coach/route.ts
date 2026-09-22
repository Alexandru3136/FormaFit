import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { getCurrentUser } from "@/lib/server/session";

type CoachRequest = {
  message?: unknown;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: CoachRequest;

  try {
    body = (await request.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (message.length < 2 || message.length > 1200) {
    return NextResponse.json(
      { error: "Message must be between 2 and 1200 characters." },
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
      { error: "Completeaza profilul inainte sa folosesti coach-ul AI." },
      { status: 428 },
    );
  }

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You are Forma, a practical fitness and nutrition coach. Answer in Romanian. Be concise, kind, non-shaming, and safety-aware. Do not diagnose medical issues. If pain, illness, pregnancy, eating disorder signs, or severe symptoms appear, recommend a qualified professional. Give actionable next steps.",
        },
        {
          role: "user",
          content: JSON.stringify({
            message,
            profile: {
              activityLevel: profile.activityLevel,
              age: profile.age,
              experienceLevel: profile.experienceLevel,
              foodPreferences: profile.foodPreferences,
              goal: profile.goal,
              heightCm: profile.heightCm,
              restrictions: profile.restrictions,
              sex: profile.sex,
              trainingDaysPerWeek: profile.trainingDaysPerWeek,
              trainingPlace: profile.trainingPlace,
              weightKg: profile.weightKg,
            },
          }),
        },
      ],
    });

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown AI error.",
      },
      { status: 502 },
    );
  }
}
