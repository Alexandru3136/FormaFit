import "server-only";
import { db } from "@/lib/server/db";

export async function hasPremiumAccess(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: {
      userId,
    },
  });

  if (!subscription) return false;
  if (subscription.status === "ACTIVE" || subscription.status === "TRIALING") return true;

  return subscription.premiumAccessUntil !== null && subscription.premiumAccessUntil > new Date();
}

export async function requirePremiumAccess(userId: string) {
  const isAllowed = await hasPremiumAccess(userId);

  if (!isAllowed) {
    throw new Error("Premium access required.");
  }
}
