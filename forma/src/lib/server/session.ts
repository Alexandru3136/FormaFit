import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/server/db";

const sessionCookieName = "forma_session";
const sessionDays = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDays);
  return expiresAt;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = getExpiryDate();

  await db.session.create({
    data: {
      expiresAt,
      tokenHash: hashToken(token),
      userId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await db.session.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    include: {
      user: {
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
        },
      },
    },
    where: {
      tokenHash: hashToken(token),
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await db.session.delete({
        where: {
          id: session.id,
        },
      });
    }

    return null;
  }

  return session.user;
}
