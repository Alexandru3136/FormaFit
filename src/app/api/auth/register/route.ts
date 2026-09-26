import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { parseAuthPayload } from "@/lib/server/auth-validation";
import { hashPassword } from "@/lib/server/password";
import { rateLimit } from "@/lib/server/rate-limit";
import { createSession } from "@/lib/server/session";

export async function POST(request: Request) {
  const blocked = await rateLimit({ key: "auth-register", limit: 3, windowSeconds: 60 });
  if (blocked) return blocked;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseAuthPayload(body, { minPasswordLength: 10, requireName: true });
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email: parsed.data.email,
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Exista deja un cont cu acest email." }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name ?? parsed.data.email.split("@")[0],
        passwordHash: hashPassword(parsed.data.password),
        subscription: {
          create: {
            status: "FREE",
          },
        },
      },
      select: {
        email: true,
        id: true,
        name: true,
        role: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
