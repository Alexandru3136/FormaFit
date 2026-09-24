"use server";

import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/i18n/config";

const oneYearSeconds = 60 * 60 * 24 * 365;

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    maxAge: oneYearSeconds,
    path: "/",
    sameSite: "lax",
  });
}
