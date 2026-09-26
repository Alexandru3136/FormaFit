"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useSyncExternalStore, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LogoutButton } from "@/features/auth/logout-button";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale";

type Theme = "light" | "dark";

const themeKey = "forma.theme";

const navigation = [
  { href: "/dashboard", icon: "A", key: "dashboard" },
  { href: "/nutrition", icon: "M", key: "nutrition" },
  { href: "/meal-plan", icon: "P", key: "mealPlan" },
  { href: "/workouts", icon: "S", key: "workouts" },
  { href: "/coach", icon: "C", key: "coach" },
  { href: "/profile", icon: "U", key: "profile" },
  { href: "/premium", icon: "+", key: "premium" },
] as const;

const mobileNavigation = navigation.slice(0, 5);

const themeEvent = "forma-theme-change";

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeEvent, callback);
  };
}

function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);

  function setTheme(value: Theme) {
    try {
      window.localStorage.setItem(themeKey, value);
    } catch {
    }
    document.documentElement.dataset.theme = value;
    window.dispatchEvent(new Event(themeEvent));
  }

  return { setTheme, theme };
}

export function PreferencesControls() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [isPending, startTransition] = useTransition();

  function changeLocale(next: Locale) {
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={t("language")}
        className="h-9 rounded-lg border border-[#ded9c8] bg-white px-2 text-xs font-black text-[#101211] outline-none disabled:opacity-60"
        disabled={isPending}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        value={locale}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
      <button
        aria-label={t("theme.toggle")}
        className="h-9 rounded-lg border border-[#ded9c8] bg-white px-3 text-xs font-black text-[#101211]"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        type="button"
      >
        {theme === "dark" ? t("theme.dark") : t("theme.light")}
      </button>
    </div>
  );
}

export function DesktopNavigation() {
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <nav className="mt-8 grid gap-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-black transition",
              isActive
                ? "bg-[#123f31] text-[#c8ff55]"
                : "text-[#4d554b] hover:bg-[#f4f2e9] hover:text-[#101211]",
            ].join(" ")}
            href={item.href}
            key={item.href}
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[#f4f2e9] text-xs text-[#123f31]">
              {item.icon}
            </span>
            {t(`nav.${item.key}`)}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}

export function MobileHeaderActions() {
  const t = useTranslations("common");

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        className="rounded-lg border border-[#ded9c8] px-3 py-2 text-xs font-black text-[#101211]"
        href="/profile"
      >
        {t("profile")}
      </Link>
      <Link
        className="rounded-lg bg-[#15171d] px-3 py-2 text-xs font-black text-white"
        href="/premium"
      >
        {t("premium")}
      </Link>
      <LogoutButton
        className="rounded-lg border border-[#ded9c8] px-3 py-2 text-xs font-black text-[#101211] transition hover:bg-[#f4f2e9]"
        label={t("logoutShort")}
      />
    </div>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const columns = useMemo(() => `repeat(${mobileNavigation.length}, minmax(0, 1fr))`, []);

  return (
    <nav
      className="app-mobile-nav fixed inset-x-0 bottom-0 z-20 grid border-t border-[#ded9c8] bg-[#101211]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 text-center text-[11px] font-black text-white shadow-[0_-18px_44px_rgba(17,19,23,0.22)] backdrop-blur xl:hidden"
      style={{ gridTemplateColumns: columns }}
    >
      {mobileNavigation.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            className={[
              "grid min-h-[56px] place-items-center gap-1 rounded-lg px-1 py-2 transition",
              isActive ? "bg-[#c8ff55] text-[#101211]" : "text-[#d8dfd2]",
            ].join(" ")}
            href={item.href}
            key={item.href}
          >
            <span
              className={[
                "grid h-6 w-6 place-items-center rounded-md text-[10px]",
                isActive ? "bg-[#101211] text-[#c8ff55]" : "bg-white/10 text-[#c8ff55]",
              ].join(" ")}
            >
              {item.icon}
            </span>
            <span>{t(`nav.${item.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
