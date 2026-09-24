export const locales = ["ro", "en", "ru", "uk", "fr", "de", "es", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ro";

export const localeCookieName = "forma_locale";

export const localeLabels: Record<Locale, string> = {
  ro: "RO",
  en: "EN",
  ru: "RU",
  uk: "UK",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
