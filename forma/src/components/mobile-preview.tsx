import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/brand-mark";
import { MetricTile } from "@/components/metric-tile";

export function MobilePreview() {
  const t = useTranslations("preview");
  const tc = useTranslations("common");

  const previewStats = [
    { label: t("caloriesLeft"), value: "620", helper: t("caloriesLeftHelper") },
    { label: t("protein"), value: "78g", helper: t("proteinHelper") },
    { label: t("water"), value: "1.6L", helper: t("waterHelper") },
  ];

  return (
    <div className="mx-auto w-full max-w-[min(390px,100%)] rounded-[24px] border border-[#d8d2bf] bg-[#111317] p-2 shadow-2xl shadow-[#111317]/20 sm:rounded-[28px] sm:p-3">
      <div className="rounded-[18px] bg-[#f7f7f2] p-3 sm:rounded-[22px] sm:p-4">
        <div className="mb-5 flex min-w-0 items-center justify-between gap-2">
          <BrandMark />
          <span className="shrink-0 rounded-md bg-[#c8ff55] px-3 py-1 text-xs font-black text-[#132013]">
            {t("free")}
          </span>
        </div>

        <section>
          <p className="text-sm font-bold text-[#667062]">{t("dashboardToday")}</p>
          <h2 className="mt-1 text-2xl font-black text-[#0f1117] sm:text-3xl">
            {t("goodMorning")}
          </h2>
          <div className="mt-5 grid gap-3">
            {previewStats.map((stat) => (
              <MetricTile key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-lg bg-[#123f31] p-4 text-white">
          <p className="text-sm font-black text-[#c8ff55]">{t("coach")}</p>
          <p className="mt-2 text-sm leading-6">
            {t("coachText")}
          </p>
        </section>

        <nav className="mt-4 grid grid-cols-4 gap-2 border-t border-[#e4dfce] pt-3 text-center text-[11px] font-black text-[#5b6259]">
          <Link href="/dashboard">{tc("nav.dashboard")}</Link>
          <Link href="/nutrition">{tc("nav.nutrition")}</Link>
          <Link href="/workouts">{tc("nav.workouts")}</Link>
          <Link href="/coach">{tc("nav.coach")}</Link>
        </nav>
      </div>
    </div>
  );
}
