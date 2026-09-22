import { NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/server/ai-json";
import { requestOmniRouteChat } from "@/lib/server/omniroute";

const targetLanguageNames: Record<string, string> = {
  de: "German",
  en: "English",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  ro: "Romanian",
  ru: "Russian",
  uk: "Ukrainian",
};

const fallbackTranslations: Record<string, Record<string, string>> = {
  de: {
    "Intra in cont": "Anmelden",
    "Iesi": "Abmelden",
    "Iesi din cont": "Abmelden",
  },
  en: {
    "Intra in cont": "Log in",
    "Iesi": "Logout",
    "Iesi din cont": "Logout",
  },
  es: {
    "Intra in cont": "Iniciar sesion",
    "Iesi": "Salir",
    "Iesi din cont": "Cerrar sesion",
  },
  fr: {
    "Intra in cont": "Se connecter",
    "Iesi": "Sortir",
    "Iesi din cont": "Se deconnecter",
  },
  it: {
    "Intra in cont": "Accedi",
    "Iesi": "Esci",
    "Iesi din cont": "Esci dall'account",
  },
  ru: {
    "Intra in cont": "Войти",
    "Iesi": "Выйти",
    "Iesi din cont": "Выйти из аккаунта",
  },
  uk: {
    "Intra in cont": "Увійти",
    "Iesi": "Вийти",
    "Iesi din cont": "Вийти з акаунта",
  },
};

type TranslateBody = {
  language?: unknown;
  texts?: unknown;
};

function normalizeTexts(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length >= 2 && item.length <= 500)
        .filter((item) => item !== "Forma")
        .slice(0, 80),
    ),
  );
}

function sanitizeTranslations(payload: unknown, texts: string[]) {
  const record = payload !== null && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const rawTranslations =
    record.translations !== null && typeof record.translations === "object"
      ? (record.translations as Record<string, unknown>)
      : record;

  return Object.fromEntries(
    texts.map((text) => {
      const translated = rawTranslations[text];
      const safeText =
        typeof translated === "string" && translated.trim().length > 0
          ? translated.trim().replaceAll(/\bForma\b/g, "Forma")
          : text;

      return [text, safeText];
    }),
  );
}

function buildFallbackTranslations(language: string, texts: string[]) {
  const dictionary = fallbackTranslations[language] ?? {};

  return Object.fromEntries(texts.map((text) => [text, dictionary[text] ?? text]));
}

export async function POST(request: Request) {
  let body: TranslateBody;

  try {
    body = (await request.json()) as TranslateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const language = typeof body.language === "string" ? body.language : "en";
  const targetLanguage = targetLanguageNames[language];

  if (!targetLanguage) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }

  const texts = normalizeTexts(body.texts);

  if (texts.length === 0 || language === "ro") {
    return NextResponse.json({ translations: Object.fromEntries(texts.map((text) => [text, text])) });
  }

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            `Translate UI strings from Romanian or mixed app UI text to ${targetLanguage}. Return only valid JSON with key "translations", an object where each original string is a key and the translated string is the value. Preserve the product name "Forma" exactly. Do not translate emails, numbers, URLs, model names, or the word Premium. Keep fitness/nutrition terminology natural and concise.`,
        },
        {
          role: "user",
          content: JSON.stringify({ texts }),
        },
      ],
      temperature: 0,
    });

    return NextResponse.json({ translations: sanitizeTranslations(extractJsonObject(answer), texts) });
  } catch (error) {
    return NextResponse.json(
      {
        aiUnavailable: true,
        error: error instanceof Error ? error.message : "Translation failed.",
        translations: buildFallbackTranslations(language, texts),
      },
      { status: 200 },
    );
  }
}
