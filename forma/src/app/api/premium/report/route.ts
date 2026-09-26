import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { rateLimit } from "@/lib/server/rate-limit";
import { getPremiumContext } from "@/lib/server/premium";

function getWeekStart() {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET() {
  const blocked = await rateLimit({ key: "premium-report", limit: 5, windowSeconds: 60 });
  if (blocked) return blocked;

  const context = await getPremiumContext();
  if (context.error) return context.error;

  const activity = await db.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    where: {
      createdAt: {
        gte: getWeekStart(),
      },
      userId: context.user.id,
    },
  });

  try {
    const report = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You are Forma Premium. Write a compact Romanian weekly report for a fitness/nutrition app. Use profile and activity logs. Include: progress summary, nutrition focus, training focus, next week actions. Be honest if data is limited.",
        },
        {
          role: "user",
          content: JSON.stringify({
            activity: activity.map((entry) => ({
              action: entry.action,
              createdAt: entry.createdAt,
              metadata: entry.metadata,
            })),
            profile: context.profile,
          }),
        },
      ],
      temperature: 0.2,
    });

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown report error." },
      { status: 502 },
    );
  }
}
