import { NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/server/ai-json";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { getPremiumContext } from "@/lib/server/premium";

export async function POST() {
  const context = await getPremiumContext();
  if (context.error) return context.error;

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You are Forma Premium. Generate personalized Romanian notification templates for a fitness/nutrition app. Return only valid JSON with key notifications. Include exactly 5 notifications. Each notification has timing, title, body, tone. Include monthly profile check-in, missed-day recovery, meal reminder, workout reminder, subscription value reminder. Friendly, concise, not pushy.",
        },
        {
          role: "user",
          content: JSON.stringify({ profile: context.profile }),
        },
      ],
      temperature: 0.35,
    });

    return NextResponse.json(extractJsonObject(answer));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown notifications error." },
      { status: 502 },
    );
  }
}
