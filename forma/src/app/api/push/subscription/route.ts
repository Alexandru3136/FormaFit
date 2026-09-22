import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

type PushBody = {
  subscription?: {
    endpoint?: unknown;
    keys?: unknown;
  };
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const activeCount = await db.pushSubscription.count({
    where: {
      disabledAt: null,
      userId: user.id,
    },
  });

  return NextResponse.json({
    activeCount,
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: PushBody;

  try {
    body = (await request.json()) as PushBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const endpoint =
    typeof body.subscription?.endpoint === "string" ? body.subscription.endpoint : "";
  const keys = body.subscription?.keys;

  if (!endpoint || keys === null || typeof keys !== "object") {
    return NextResponse.json({ error: "Subscription invalida." }, { status: 400 });
  }

  const subscription = await db.pushSubscription.upsert({
    create: {
      endpoint,
      keysJson: JSON.stringify(keys),
      userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
      userId: user.id,
    },
    update: {
      disabledAt: null,
      keysJson: JSON.stringify(keys),
      userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? "",
      userId: user.id,
    },
    where: {
      endpoint,
    },
  });

  return NextResponse.json({ subscriptionId: subscription.id }, { status: 201 });
}
