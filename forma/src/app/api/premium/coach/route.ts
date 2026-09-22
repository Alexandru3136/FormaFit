import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { getPremiumContext } from "@/lib/server/premium";

const premiumCoachAction = "PREMIUM_COACH_MESSAGE";

export async function POST(request: Request) {
  const context = await getPremiumContext();
  if (context.error) return context.error;

  let body: { message?: unknown };

  try {
    body = (await request.json()) as { message?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (message.length < 2 || message.length > 1600) {
    return NextResponse.json(
      { error: "Mesajul trebuie sa aiba intre 2 si 1600 caractere." },
      { status: 400 },
    );
  }

  const recentMemory = await db.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
    where: {
      action: premiumCoachAction,
      userId: context.user.id,
    },
  });

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You are Forma Premium, a Romanian AI coach for nutrition and training. Use the user's profile and recent memory. Be practical, concise, non-shaming, and safety-aware. Track progress, suggest next actions, and avoid medical diagnosis.",
        },
        {
          role: "user",
          content: JSON.stringify({
            memory: recentMemory.map((entry) => entry.metadata).filter(Boolean),
            message,
            profile: context.profile,
          }),
        },
      ],
      temperature: 0.25,
    });

    await db.auditLog.create({
      data: {
        action: premiumCoachAction,
        metadata: JSON.stringify({
          answer: answer.slice(0, 1200),
          message: message.slice(0, 800),
        }),
        userId: context.user.id,
      },
    });

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown premium coach error." },
      { status: 502 },
    );
  }
}
