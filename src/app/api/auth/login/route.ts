import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { parseAuthPayload } from "@/lib/server/auth-validation";
import { verifyPassword } from "@/lib/server/password";
import { rateLimit } from "@/lib/server/rate-limit";
import { createSession } from "@/lib/server/session";

export async function POST(request: Request) {
  const blocked = await rateLimit({ key: "auth-login", limit: 5, windowSeconds: 60 });
  if (blocked) return blocked;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseAuthPayload(body);
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "Email sau parola incorecta." }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
}
