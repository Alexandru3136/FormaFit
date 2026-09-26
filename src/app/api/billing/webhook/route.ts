import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getStripe } from "@/lib/server/stripe";

export const runtime = "nodejs";

function mapSubscriptionStatus(status: string) {
  if (status === "active") return "ACTIVE";
  if (status === "trialing") return "TRIALING";
  if (status === "past_due") return "PAST_DUE";
  if (status === "canceled") return "CANCELED";
  return "EXPIRED";
}

type StripeSubscriptionRuntime = {
  current_period_end?: unknown;
  customer?: string | { id: string };
  id: string;
  metadata: {
    userId?: string;
  };
  status: string;
};

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook signature is not configured." }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as StripeSubscriptionRuntime;
    const userId = subscription.metadata.userId;

    if (userId) {
      const currentPeriodEnd =
        typeof subscription.current_period_end === "number"
          ? new Date(subscription.current_period_end * 1000)
          : null;

      await db.subscription.upsert({
        create: {
          lastVerifiedWebhookEvent: event.id,
          premiumAccessUntil: currentPeriodEnd,
          status: mapSubscriptionStatus(subscription.status),
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id,
          stripeCurrentPeriodEnd: currentPeriodEnd,
          stripeSubscriptionId: subscription.id,
          userId,
        },
        update: {
          lastVerifiedWebhookEvent: event.id,
          premiumAccessUntil: currentPeriodEnd,
          status: mapSubscriptionStatus(subscription.status),
          stripeCurrentPeriodEnd: currentPeriodEnd,
          stripeSubscriptionId: subscription.id,
        },
        where: {
          userId,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
