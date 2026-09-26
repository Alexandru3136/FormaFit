import "server-only";
import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
  });
}

export function getBillingConfig() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3001";
  const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!premiumPriceId) {
    throw new Error("Missing STRIPE_PREMIUM_PRICE_ID.");
  }

  return {
    appUrl: appUrl.replace(/\/$/, ""),
    premiumPriceId,
    webhookSecret,
  };
}
