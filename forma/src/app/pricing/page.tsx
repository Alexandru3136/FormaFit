import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { BillingButton } from "@/features/billing/billing-button";
import { PreferencesControls } from "@/features/preferences/app-preferences";
import { db } from "@/lib/server/db";
import { hasPremiumAccess } from "@/lib/server/access";
import { getCurrentUser } from "@/lib/server/session";

const freeFeatures = [
  "Profil, calculator calorii si macro-uri",
  "Jurnal alimentar text si estimare masa",
  "2 generari AI de idei de masa / zi",
  "Plan sala dupa zilele disponibile",
  "Coach AI basic",
];

const premiumFeatures = [
  "Coach AI cu memorie",
  "Plan alimentar 3/7 zile",
  "Raport saptamanal",
  "Analiza poza cu mancare",
  "Notificari personalizate",
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const subscription = user
    ? await db.subscription.findUnique({
        where: {
          userId: user.id,
        },
      })
    : null;
  const isPremium = user ? await hasPremiumAccess(user.id) : false;

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-5 text-[#181a1f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2 sm:gap-3">
            <PreferencesControls />
            <Link
              className="rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 py-2 text-sm font-black text-[#15171d]"
              href={user ? "/dashboard" : "/login"}
            >
              {user ? "Dashboard" : "Intra in cont"}
            </Link>
            {!user ? (
              <Link
                className="rounded-lg bg-[#15171d] px-4 py-2 text-sm font-black text-white"
                href="/register"
              >
                Creeaza cont
              </Link>
            ) : null}
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#527b20]">
            abonament
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.96] sm:text-6xl">
            Alege cat AI vrei in rutina ta.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#62695f]">
            Free ramane util pentru inceput. Premium adauga planuri salvate, analiza
            mai bogata si memorie de progres.
          </p>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-[#527b20]">Free</p>
          <h2 className="mt-2 text-4xl font-black">$0</h2>
          <p className="mt-2 text-sm font-semibold text-[#62695f]">Pentru start si consistenta.</p>
          <div className="mt-5 grid gap-3">
            {freeFeatures.map((feature) => (
              <p className="rounded-lg bg-[#fbfaf4] p-4 text-sm font-bold" key={feature}>
                {feature}
              </p>
            ))}
          </div>
          {!user ? (
            <Link
              className="mt-5 block rounded-lg bg-[#15171d] p-4 text-sm font-black text-white"
              href="/register"
            >
              Incepe gratuit
            </Link>
          ) : (
            <Link
              className="mt-5 block rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-4 text-sm font-black text-[#123f31]"
              href="/dashboard"
            >
              Continua cu Free
            </Link>
          )}
        </section>

        <section className="rounded-lg bg-[#111317] p-5 text-white shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#c8ff55]">Premium</p>
              <h2 className="mt-2 text-4xl font-black">$9.99</h2>
              <p className="mt-2 text-sm font-semibold text-[#d9dfd3]">pe luna</p>
            </div>
            <span className="w-fit rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-black text-[#c8ff55]">
              {isPremium ? "Activ" : subscription?.status ?? "Upgrade"}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {premiumFeatures.map((feature) => (
              <p className="rounded-lg bg-white/[0.07] p-4 text-sm font-bold" key={feature}>
                {feature}
              </p>
            ))}
          </div>
          <div className="mt-5">
            {isPremium ? (
              <a
                className="block rounded-lg bg-[#c8ff55] p-4 text-sm font-black text-[#101211]"
                href="/premium"
              >
                Deschide Premium
              </a>
            ) : !user ? (
              <Link
                className="block rounded-lg bg-[#c8ff55] p-4 text-sm font-black text-[#101211]"
                href="/register?plan=premium"
              >
                Creeaza cont pentru Premium
              </Link>
            ) : (
              <BillingButton />
            )}
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-5 text-sm font-semibold leading-6 text-[#5d531c]">
        Plata singura nu deschide accesul in UI. Forma asteapta confirmarea reala
        din webhook-ul Stripe semnat; abia dupa aceea statusul abonamentului devine
        ACTIVE/TRIALING si functiile Premium se deblocheaza.
      </section>

        <footer className="mt-8 flex flex-wrap gap-4 border-t border-[#ded9c8] pt-6 text-sm font-black text-[#4d554b]">
          <Link href="/">Acasa</Link>
          <Link href="/terms">Termeni</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
