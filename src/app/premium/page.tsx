import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { PremiumHub } from "@/features/premium/premium-hub";
import { hasPremiumAccess } from "@/lib/server/access";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function PremiumPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isPremium = await hasPremiumAccess(user.id);

  if (!isPremium) {
    redirect("/pricing?premium_required=1");
  }

  const tp = await getTranslations("pages");

  return (
    <AppShell kicker={tp("premiumKicker")} title={tp("premiumTitle")}>
      <PremiumHub />
    </AppShell>
  );
}
