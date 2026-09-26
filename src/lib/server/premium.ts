import "server-only";

import { NextResponse } from "next/server";
import { hasPremiumAccess } from "@/lib/server/access";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export async function getPremiumContext() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 }),
      profile: null,
      user: null,
    };
  }

  const isPremium = await hasPremiumAccess(user.id);
  if (!isPremium) {
    return {
      error: NextResponse.json(
        { error: "Premium este necesar pentru aceasta functie." },
        { status: 403 },
      ),
      profile: null,
      user,
    };
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!profile) {
    return {
      error: NextResponse.json(
        { error: "Completeaza profilul inainte sa folosesti Premium." },
        { status: 428 },
      ),
      profile: null,
      user,
    };
  }

  return {
    error: null,
    profile,
    user,
  };
}
