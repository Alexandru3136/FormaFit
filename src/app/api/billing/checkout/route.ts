import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/session";
import { getBillingConfig, getStripe } from "@/lib/server/stripe";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const config = getBillingConfig();

    const session = await stripe.checkout.sessions.create({
      cancel_url: `${config.appUrl}/pricing?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [
        {
          price: config.premiumPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${config.appUrl}/dashboard?checkout=success`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Billing error." },
      { status: 500 },
    );
  }
}
