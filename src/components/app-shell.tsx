import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { PwaInstallButton } from "@/components/pwa-install-button";
import {
  DesktopNavigation,
  MobileHeaderActions,
  MobileNavigation,
  PreferencesControls,
} from "@/features/preferences/app-preferences";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  kicker: string;
};

export async function AppShell({ children, title, kicker }: AppShellProps) {
  const t = await getTranslations("common");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f2] pb-24 text-[#181a1f] xl:pb-0">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-3 py-3 sm:px-5 sm:py-5 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-6 xl:px-8">
        <aside className="app-sidebar hidden rounded-lg border border-[#ded9c8] bg-white p-4 shadow-sm xl:block">
          <BrandMark href="/dashboard" />
          <DesktopNavigation />
        </aside>

        <section className="min-w-0">
          <div className="app-mobile-header mb-4 rounded-lg border border-[#ded9c8] bg-white px-3 py-3 shadow-sm sm:px-4 xl:hidden">
            <div className="flex items-center justify-between gap-3">
              <BrandMark href="/dashboard" />
              <MobileHeaderActions />
            </div>
            <div className="mt-3 flex justify-end">
              <PreferencesControls />
            </div>
          </div>

          <header className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
                {kicker}
              </p>
              <h1 className="mt-2 text-[2rem] font-black leading-[0.98] text-[#101211] sm:text-4xl">
                {title}
              </h1>
            </div>
            <Link
              className="hidden rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white sm:inline-flex"
              href="/dashboard"
            >
              {t("start")}
            </Link>
            <div className="hidden items-center gap-3 sm:flex">
              <PreferencesControls />
              <PwaInstallButton />
            </div>
          </header>
          {children}
        </section>
      </div>

      <MobileNavigation />
    </main>
  );
}
