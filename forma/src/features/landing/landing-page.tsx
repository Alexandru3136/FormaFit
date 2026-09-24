"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/action-button";
import { BrandMark } from "@/components/brand-mark";
import { MobilePreview } from "@/components/mobile-preview";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { SectionTitle } from "@/components/section-title";
import { PreferencesControls } from "@/features/preferences/app-preferences";

function AnimatedBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "56px 56px"] }}
        className="absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            "linear-gradient(#123f3112 1px, transparent 1px), linear-gradient(90deg, #123f3112 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      />

      <motion.div
        animate={{ x: ["-18%", "14%", "-18%"], y: ["0%", "7%", "0%"] }}
        className="absolute left-[-28%] top-[18%] hidden h-[52vh] w-[60vw] rounded-lg border border-[#123f31]/10 bg-white/[0.45] shadow-[0_24px_90px_rgba(17,19,23,0.06)] sm:block"
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.div
        animate={{ x: ["14%", "-10%", "14%"], y: ["0%", "-9%", "0%"] }}
        className="absolute right-[-18%] top-[10%] hidden h-[62vh] w-[42vw] rounded-lg border border-[#c8ff55]/40 bg-[#c8ff55]/10 shadow-[0_24px_90px_rgba(17,19,23,0.06)] lg:block"
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.div
        animate={{ pathLength: [0.25, 1, 0.25], pathOffset: [0, 0.22, 0.46] }}
        className="absolute left-0 top-[8%] hidden h-[70vh] w-full opacity-70 md:block"
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      >
        <svg className="h-full w-full" fill="none" viewBox="0 0 1200 620">
          <motion.path
            d="M-40 470 C 180 350, 250 525, 430 380 S 760 95, 930 235 S 1100 440, 1260 300"
            stroke="#c8ff55"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <motion.path
            d="M-20 190 C 190 120, 310 240, 500 150 S 760 85, 920 170 S 1060 310, 1240 210"
            stroke="#123f31"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.15, 0.38, 0.15], scaleX: [0.65, 1, 0.65] }}
        className="absolute bottom-[18%] left-[8%] hidden h-1 w-44 origin-left rounded-full bg-[#c8ff55] sm:block"
        transition={{ duration: 3.8, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        animate={{ opacity: [0.12, 0.32, 0.12], scaleX: [1, 0.5, 1] }}
        className="absolute right-[16%] top-[24%] hidden h-1 w-52 origin-right rounded-full bg-[#123f31] sm:block"
        transition={{ duration: 4.6, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-[#f7f7f2]" />
    </div>
  );
}

export function LandingPage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  const heroActions = [
    { href: "/register", label: t("ctaStartFree"), tone: "lime" as const },
    { href: "/login", label: t("ctaHaveAccount"), tone: "dark" as const },
  ];

  const productFlow = [
    { step: "01", title: t("flow.step1Title"), body: t("flow.step1Body") },
    { step: "02", title: t("flow.step2Title"), body: t("flow.step2Body") },
    { step: "03", title: t("flow.step3Title"), body: t("flow.step3Body") },
  ];

  const nutritionCards = [
    { title: t("nutritionCard1Title"), meta: t("nutritionCard1Meta"), body: t("nutritionCard1Body") },
    { title: t("nutritionCard2Title"), meta: t("nutritionCard2Meta"), body: t("nutritionCard2Body") },
    { title: t("nutritionCard3Title"), meta: t("nutritionCard3Meta"), body: t("nutritionCard3Body") },
  ];

  const workoutImages = [
    { src: "/exercises/dumbbell-press.png", title: t("workoutUpperTitle"), body: t("workoutUpperBody") },
    { src: "/exercises/squat.png", title: t("workoutLowerTitle"), body: t("workoutLowerBody") },
    { src: "/exercises/plank.png", title: t("workoutCoreTitle"), body: t("workoutCoreBody") },
  ];

  const badges = [t("badgeFreeAi"), t("badgePwa"), t("badgePremium")];

  const premiumItems = [
    t("premiumItem1"),
    t("premiumItem2"),
    t("premiumItem3"),
    t("premiumItem4"),
    t("premiumItem5"),
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f2] text-[#181a1f]">
      <AnimatedBackdrop />
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-20 pt-4 sm:gap-16 sm:px-6 sm:pb-24 sm:pt-5 lg:px-8">
        <header className="flex min-w-0 items-center justify-between gap-3">
          <BrandMark />
          <div className="flex shrink-0 items-center gap-2">
            <PreferencesControls />
            <Link
              className="rounded-lg border border-[#ded9c8] px-3 py-2 text-xs font-black text-[#101211] sm:text-sm"
              href="/pricing"
            >
              {tc("plans")}
            </Link>
            <Link
              className="rounded-lg bg-[#15171d] px-3 py-2 text-xs font-black text-white transition hover:bg-[#252832] sm:px-4 sm:text-sm"
              href="/register"
            >
              {tc("account")}
            </Link>
          </div>
        </header>

        <div className="grid min-h-[auto] gap-8 pt-4 sm:pt-8 lg:min-h-[calc(100vh-120px)] lg:grid-cols-[1fr_440px] lg:items-center lg:pt-0">
          <section className="max-w-3xl pt-2 opacity-100 sm:pt-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#527b20]">
              {t("eyebrow")}
            </p>
            <h1
              className="mt-5 text-[3rem] font-black leading-[0.92] text-[#0f1117] sm:mt-6 sm:text-6xl lg:text-7xl"
            >
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f665c] sm:text-xl">
              {t("heroBody")}
            </p>

            <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2">
              {heroActions.map((action) => (
                <motion.div key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <ActionButton href={action.href} label={action.label} tone={action.tone} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {badges.map((item) => (
                <div
                  className="rounded-lg border border-[#ded9c8] bg-white p-3 text-sm font-black text-[#123f31] shadow-sm"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <PwaInstallButton />
            </div>
          </section>

          <motion.div
            animate={{ rotate: 0, y: 0 }}
            className="w-full"
            initial={false}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <MobilePreview />
          </motion.div>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          {productFlow.map((item) => (
            <article
              className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm"
              key={item.step}
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#123f31] text-sm font-black text-[#c8ff55]">
                {item.step}
              </span>
              <h2 className="mt-4 text-xl font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#62695f]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionTitle
              body={t("nutritionBody")}
              eyebrow={t("nutritionEyebrow")}
              title={t("nutritionTitle")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {nutritionCards.map((card) => (
              <article
                className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm"
                key={card.title}
              >
                <p className="text-sm font-black text-[#527b20]">{card.meta}</p>
                <h3 className="mt-3 text-xl font-black text-[#111317]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#656b62]">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionTitle
              body={t("workoutsBody")}
              eyebrow={t("workoutsEyebrow")}
              title={t("workoutsTitle")}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {workoutImages.map((item) => (
              <article
                className="overflow-hidden rounded-lg border border-[#ded9c8] bg-white shadow-sm"
                key={item.title}
              >
                <Image
                  alt={t("workoutImageAlt", { name: item.title })}
                  className="h-44 w-full object-cover"
                  height={720}
                  src={item.src}
                  width={1280}
                />
                <div className="p-4">
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#62695f]">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-[#111317] p-5 text-white shadow-2xl shadow-[#111317]/15 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8ff55]">
                {t("premiumEyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-black">{t("premiumTitle")}</h2>
              <p className="mt-4 text-base leading-7 text-[#d9dfd3]">
                {t("premiumBody")}
              </p>
              <div className="mt-5">
                <ActionButton href="/pricing" label={t("premiumCta")} tone="lime" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {premiumItems.map((item) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold leading-6 text-[#f3f6ef]"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap gap-4 border-t border-[#ded9c8] pt-6 text-sm font-black text-[#4d554b]">
          <Link href="/terms">{t("footerTerms")}</Link>
          <Link href="/privacy">{t("footerPrivacy")}</Link>
        </footer>
      </section>
    </main>
  );
}
