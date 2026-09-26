import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { clearSession, getCurrentUser } from "@/lib/server/session";

type AccountBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function readBody(request: Request): Promise<AccountBody | null> {
  try {
    return (await request.json()) as AccountBody;
  } catch {
    return null;
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const body = await readBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const currentPassword = getString(body.currentPassword);
  const newPassword = getString(body.newPassword);

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Parola noua trebuie sa aiba minim 8 caractere." }, { status: 400 });
  }

  const account = await db.user.findUnique({
    select: {
      passwordHash: true,
    },
    where: {
      id: user.id,
    },
  });

  if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
    return NextResponse.json({ error: "Parola curenta nu este corecta." }, { status: 403 });
  }

  await db.user.update({
    data: {
      passwordHash: hashPassword(newPassword),
    },
    where: {
      id: user.id,
    },
  });

  await db.session.deleteMany({
    where: {
      userId: user.id,
    },
  });
  await clearSession();

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const body = await readBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const currentPassword = getString(body.currentPassword);
  const account = await db.user.findUnique({
    select: {
      passwordHash: true,
    },
    where: {
      id: user.id,
    },
  });

  if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
    return NextResponse.json({ error: "Parola curenta nu este corecta." }, { status: 403 });
  }

  await db.user.delete({
    where: {
      id: user.id,
    },
  });
  await clearSession();

  return NextResponse.json({ ok: true });
}
