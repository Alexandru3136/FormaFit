"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { LogoutButton } from "@/features/auth/logout-button";

type Language = "en" | "ro" | "ru" | "uk" | "fr" | "de" | "es" | "it";
type Theme = "light" | "dark";

const languageKey = "forma.language";
const themeKey = "forma.theme";
const preferencesEvent = "forma-preferences-change";
const translationCachePrefix = "forma.i18n.v3.";
const legacyTranslationCachePrefixes = ["forma.i18n.", "forma.i18n.v2."];
const originalTextNodes = new WeakMap<Text, string>();
const inFlightTranslations = new Set<string>();

const languages: Array<{ code: Language; label: string }> = [
  { code: "en", label: "EN" },
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
  { code: "uk", label: "UK" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
];

const translations: Record<
  Language,
  {
    nav: Record<string, string>;
    premium: string;
    profile: string;
    theme: Record<Theme, string>;
  }
> = {
  de: {
    nav: {
      "/coach": "Coach",
      "/dashboard": "Heute",
      "/meal-plan": "Plan",
      "/nutrition": "Mahlzeiten",
      "/premium": "Premium",
      "/profile": "Profil",
      "/workouts": "Training",
    },
    premium: "Premium",
    profile: "Profil",
    theme: { dark: "Dunkel", light: "Hell" },
  },
  en: {
    nav: {
      "/coach": "Coach",
      "/dashboard": "Today",
      "/meal-plan": "Plan",
      "/nutrition": "Meals",
      "/premium": "Premium",
      "/profile": "Profile",
      "/workouts": "Gym",
    },
    premium: "Premium",
    profile: "Profile",
    theme: { dark: "Dark", light: "Light" },
  },
  es: {
    nav: {
      "/coach": "Coach",
      "/dashboard": "Hoy",
      "/meal-plan": "Plan",
      "/nutrition": "Comidas",
      "/premium": "Premium",
      "/profile": "Perfil",
      "/workouts": "Gym",
    },
    premium: "Premium",
    profile: "Perfil",
    theme: { dark: "Oscuro", light: "Claro" },
  },
  fr: {
    nav: {
      "/coach": "Coach",
      "/dashboard": "Jour",
      "/meal-plan": "Plan",
      "/nutrition": "Repas",
      "/premium": "Premium",
      "/profile": "Profil",
      "/workouts": "Sport",
    },
    premium: "Premium",
    profile: "Profil",
    theme: { dark: "Noir", light: "Clair" },
  },
  it: {
    nav: {
      "/coach": "Coach",
      "/dashboard": "Oggi",
      "/meal-plan": "Piano",
      "/nutrition": "Pasti",
      "/premium": "Premium",
      "/profile": "Profilo",
      "/workouts": "Palestra",
    },
    premium: "Premium",
    profile: "Profilo",
    theme: { dark: "Scuro", light: "Chiaro" },
  },
  ro: {
    nav: {
      "/coach": "Coach",
      "/dashboard": "Azi",
      "/meal-plan": "Plan",
      "/nutrition": "Mese",
      "/premium": "Premium",
      "/profile": "Profil",
      "/workouts": "Sala",
    },
    premium: "Premium",
    profile: "Profil",
    theme: { dark: "Negru", light: "Alb" },
  },
  ru: {
    nav: {
      "/coach": "Коуч",
      "/dashboard": "Сегодня",
      "/meal-plan": "План",
      "/nutrition": "Еда",
      "/premium": "Премиум",
      "/profile": "Профиль",
      "/workouts": "Зал",
    },
    premium: "Премиум",
    profile: "Профиль",
    theme: { dark: "Темная", light: "Светлая" },
  },
  uk: {
    nav: {
      "/coach": "Коуч",
      "/dashboard": "Сьогодні",
      "/meal-plan": "План",
      "/nutrition": "Їжа",
      "/premium": "Преміум",
      "/profile": "Профіль",
      "/workouts": "Зал",
    },
    premium: "Преміум",
    profile: "Профіль",
    theme: { dark: "Темна", light: "Світла" },
  },
};

const navigation = [
  { href: "/dashboard", icon: "A" },
  { href: "/nutrition", icon: "M" },
  { href: "/meal-plan", icon: "P" },
  { href: "/workouts", icon: "S" },
  { href: "/coach", icon: "C" },
  { href: "/profile", icon: "U" },
  { href: "/premium", icon: "+" },
];

const mobileNavigation = navigation.slice(0, 5);

function readLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(languageKey) as Language | null;
  return saved && saved in translations ? saved : "en";
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
}

function getPreferencesSnapshot() {
  return `${readLanguage()}:${readTheme()}`;
}

function getServerPreferencesSnapshot() {
  return "en:light";
}

function subscribePreferences(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(preferencesEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(preferencesEvent, callback);
  };
}

export function usePreferences() {
  const snapshot = useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    getServerPreferencesSnapshot,
  );
  const [savedLanguage, savedTheme] = snapshot.split(":") as [Language, Theme];
  const language: Language = savedLanguage in translations ? savedLanguage : "en";
  const theme: Theme = savedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
  }, [language, theme]);

  function setLanguage(value: Language) {
    window.localStorage.setItem(languageKey, value);
    document.documentElement.lang = value;
    window.dispatchEvent(new Event(preferencesEvent));
  }

  function setTheme(value: Theme) {
    window.localStorage.setItem(themeKey, value);
    document.documentElement.dataset.theme = value;
    window.dispatchEvent(new Event(preferencesEvent));
  }

  return {
    copy: translations[language],
    language,
    setLanguage,
    setTheme,
    theme,
  };
}

const staticTextTranslations: Record<Language, Record<string, string>> = {
  de: {
    "2 free AI/zi": "2 freie KI/Tag",
    "AI fitness coach": "KI-Fitness-Coach",
    "AI pe ingrediente": "KI nach Zutaten",
    "Abonament": "Abo",
    "Adauga masa": "Mahlzeit hinzufügen",
    "Ai deja cont?": "Du hast schon ein Konto?",
    "Alb": "Hell",
    "Analiza poza cu mancare": "Essensfoto analysieren",
    "Am deja cont": "Ich habe ein Konto",
    "Coach AI cu memorie": "KI-Coach mit Gedächtnis",
    "Cont": "Konto",
    "Creeaza cont": "Konto erstellen",
    "Dashboard": "Dashboard",
    "Email": "E-Mail",
    "Estimeaza cu Forma AI": "Mit Forma AI schätzen",
    "Forma ta, condusa de un coach AI.": "Deine Form, geführt von einem KI-Coach.",
    "Free generos, Premium mai generos": "Großzügig kostenlos, noch mehr mit Premium",
    "Incepe gratuit": "Kostenlos starten",
    "Intreaba Forma": "Frag Forma",
    "Istoric din contul tau": "Verlauf deines Kontos",
    "Jurnal rapid": "Schnelles Journal",
    "Limba": "Sprache",
    "Mese si calorii": "Mahlzeiten und Kalorien",
    "Nume": "Name",
    "Parola": "Passwort",
    "Plan alimentar 3/7 zile": "Essensplan 3/7 Tage",
    "Planuri": "Pläne",
    "Planul tau de sala": "Dein Trainingsplan",
    "Privacy": "Datenschutz",
    "Profil": "Profil",
    "Raport saptamanal": "Wochenbericht",
    "Salveaza masa": "Mahlzeit speichern",
    "Setari aplicatie": "App-Einstellungen",
    "Termeni": "Bedingungen",
    "Tema": "Design",
    "Vezi abonamentul": "Abo ansehen",
  },
  en: {
    "2 free AI/zi": "2 free AI/day",
    "AI fitness coach": "AI fitness coach",
    "AI pe ingrediente": "Ingredient AI",
    "Abonament": "Subscription",
    "Adauga masa": "Add meal",
    "Ai deja cont?": "Already have an account?",
    "Alb": "Light",
    "Analiza poza cu mancare": "Food photo analysis",
    "Am deja cont": "I already have an account",
    "Azi in plan": "Today in plan",
    "BMR / TDEE": "BMR / TDEE",
    "Calorii": "Calories",
    "Coach": "Coach",
    "Coach AI cu memorie": "AI coach with memory",
    "Consumate azi": "Consumed today",
    "Cont": "Account",
    "Creeaza cont": "Create account",
    "Dashboard": "Dashboard",
    "Email": "Email",
    "Estimeaza cu Forma AI": "Estimate with Forma AI",
    "Fara plan activ": "No active plan",
    "Forma ta, condusa de un coach AI.": "Your shape, guided by an AI coach.",
    "Free generos, Premium mai generos": "Generous Free, richer Premium",
    "Genereaza un plan Premium": "Generate a Premium plan",
    "Incepe gratuit": "Start free",
    "Intreaba Forma": "Ask Forma",
    "Istoric cont": "Account history",
    "Istoric din contul tau": "Your account history",
    "Jurnal rapid": "Quick log",
    "Limba": "Language",
    "MACRO-URI": "MACROS",
    "Mese si calorii": "Meals and calories",
    "Nume": "Name",
    "Parola": "Password",
    "Plan alimentar 3/7 zile": "3/7 day meal plan",
    "Plan alimentar activ": "Active meal plan",
    "Plan sala": "Gym plan",
    "Planuri": "Plans",
    "Planul tau de sala": "Your gym plan",
    "Profil activ": "Active profile",
    "Privacy": "Privacy",
    "Profil": "Profile",
    "Proteine": "Protein",
    "Raport saptamanal": "Weekly report",
    "Salveaza masa": "Save meal",
    "Sala saptamana": "Gym this week",
    "Setari aplicatie": "App settings",
    "Termeni": "Terms",
    "Tema": "Theme",
    "Urmatoarea masa": "Next meal",
    "Vezi abonamentul": "View subscription",
    "Vezi planul complet": "View full plan",
    "calorii": "calories",
    "carbohidrati": "carbs",
    "crestere masa": "muscle gain",
    "din": "of",
    "grasimi": "fat",
    "kcal ramase": "kcal left",
    "mentinere": "maintenance",
    "mese azi": "meals today",
    "planificate": "planned",
    "progres azi": "today's progress",
    "proteine": "protein",
    "ramase": "left",
    "slabire": "weight loss",
    "tinta": "target",
  },
  es: {
    "2 free AI/zi": "2 IA gratis/dia",
    "AI fitness coach": "Coach fitness IA",
    "Abonament": "Suscripcion",
    "Adauga masa": "Agregar comida",
    "Ai deja cont?": "Ya tienes cuenta?",
    "Analiza poza cu mancare": "Analisis de foto de comida",
    "Am deja cont": "Ya tengo cuenta",
    "Coach AI cu memorie": "Coach IA con memoria",
    "Cont": "Cuenta",
    "Creeaza cont": "Crear cuenta",
    "Estimeaza cu Forma AI": "Estimar con Forma AI",
    "Forma ta, condusa de un coach AI.": "Tu forma, guiada por un coach IA.",
    "Incepe gratuit": "Empezar gratis",
    "Intreaba Forma": "Pregunta a Forma",
    "Istoric din contul tau": "Historial de tu cuenta",
    "Jurnal rapid": "Registro rapido",
    "Mese si calorii": "Comidas y calorias",
    "Nume": "Nombre",
    "Parola": "Contrasena",
    "Plan alimentar 3/7 zile": "Plan de comidas 3/7 dias",
    "Planuri": "Planes",
    "Planul tau de sala": "Tu plan de gimnasio",
    "Profil": "Perfil",
    "Raport saptamanal": "Informe semanal",
    "Salveaza masa": "Guardar comida",
    "Setari aplicatie": "Ajustes",
    "Termeni": "Terminos",
    "Vezi abonamentul": "Ver suscripcion",
  },
  fr: {
    "2 free AI/zi": "2 IA gratuites/jour",
    "AI fitness coach": "Coach fitness IA",
    "Abonament": "Abonnement",
    "Adauga masa": "Ajouter un repas",
    "Ai deja cont?": "Deja un compte ?",
    "Analiza poza cu mancare": "Analyse photo repas",
    "Am deja cont": "J'ai deja un compte",
    "Coach AI cu memorie": "Coach IA avec memoire",
    "Cont": "Compte",
    "Creeaza cont": "Creer un compte",
    "Estimeaza cu Forma AI": "Estimer avec Forma AI",
    "Forma ta, condusa de un coach AI.": "Ta forme, guidee par un coach IA.",
    "Incepe gratuit": "Commencer gratuitement",
    "Intreaba Forma": "Demander a Forma",
    "Istoric din contul tau": "Historique de ton compte",
    "Jurnal rapid": "Journal rapide",
    "Mese si calorii": "Repas et calories",
    "Nume": "Nom",
    "Parola": "Mot de passe",
    "Plan alimentar 3/7 zile": "Plan repas 3/7 jours",
    "Planuri": "Plans",
    "Planul tau de sala": "Ton plan sport",
    "Profil": "Profil",
    "Raport saptamanal": "Rapport hebdo",
    "Salveaza masa": "Enregistrer le repas",
    "Setari aplicatie": "Reglages",
    "Termeni": "Conditions",
    "Vezi abonamentul": "Voir l'abonnement",
  },
  it: {
    "2 free AI/zi": "2 AI gratis/giorno",
    "AI fitness coach": "Coach fitness AI",
    "Abonament": "Abbonamento",
    "Adauga masa": "Aggiungi pasto",
    "Ai deja cont?": "Hai gia un account?",
    "Analiza poza cu mancare": "Analisi foto cibo",
    "Am deja cont": "Ho gia un account",
    "Coach AI cu memorie": "Coach AI con memoria",
    "Cont": "Account",
    "Creeaza cont": "Crea account",
    "Estimeaza cu Forma AI": "Stima con Forma AI",
    "Forma ta, condusa de un coach AI.": "La tua forma, guidata da un coach AI.",
    "Incepe gratuit": "Inizia gratis",
    "Intreaba Forma": "Chiedi a Forma",
    "Istoric din contul tau": "Cronologia del tuo account",
    "Jurnal rapid": "Diario rapido",
    "Mese si calorii": "Pasti e calorie",
    "Nume": "Nome",
    "Parola": "Password",
    "Plan alimentar 3/7 zile": "Piano pasti 3/7 giorni",
    "Planuri": "Piani",
    "Planul tau de sala": "Il tuo piano palestra",
    "Profil": "Profilo",
    "Raport saptamanal": "Report settimanale",
    "Salveaza masa": "Salva pasto",
    "Setari aplicatie": "Impostazioni",
    "Termeni": "Termini",
    "Vezi abonamentul": "Vedi abbonamento",
  },
  ro: {},
  ru: {
    "2 free AI/zi": "2 AI бесплатно/день",
    "AI fitness coach": "AI фитнес-коуч",
    "Abonament": "Подписка",
    "Adauga masa": "Добавить прием пищи",
    "Ai deja cont?": "Уже есть аккаунт?",
    "Analiza poza cu mancare": "Анализ фото еды",
    "Am deja cont": "У меня уже есть аккаунт",
    "Coach AI cu memorie": "AI-коуч с памятью",
    "Cont": "Аккаунт",
    "Creeaza cont": "Создать аккаунт",
    "Estimeaza cu Forma AI": "Оценить с Forma AI",
    "Forma ta, condusa de un coach AI.": "Твоя форма под руководством AI-коуча.",
    "Incepe gratuit": "Начать бесплатно",
    "Intreaba Forma": "Спросить Forma",
    "Istoric din contul tau": "История твоего аккаунта",
    "Jurnal rapid": "Быстрый журнал",
    "Mese si calorii": "Еда и калории",
    "Nume": "Имя",
    "Parola": "Пароль",
    "Plan alimentar 3/7 zile": "План питания 3/7 дней",
    "Planuri": "Планы",
    "Planul tau de sala": "Твой план тренировок",
    "Profil": "Профиль",
    "Raport saptamanal": "Недельный отчет",
    "Salveaza masa": "Сохранить прием пищи",
    "Setari aplicatie": "Настройки",
    "Termeni": "Условия",
    "Vezi abonamentul": "Посмотреть подписку",
  },
  uk: {
    "2 free AI/zi": "2 AI безкоштовно/день",
    "AI fitness coach": "AI фітнес-коуч",
    "Abonament": "Підписка",
    "Adauga masa": "Додати прийом їжі",
    "Ai deja cont?": "Вже маєш акаунт?",
    "Analiza poza cu mancare": "Аналіз фото їжі",
    "Am deja cont": "У мене вже є акаунт",
    "Coach AI cu memorie": "AI-коуч з пам'яттю",
    "Cont": "Акаунт",
    "Creeaza cont": "Створити акаунт",
    "Estimeaza cu Forma AI": "Оцінити з Forma AI",
    "Forma ta, condusa de un coach AI.": "Твоя форма під керівництвом AI-коуча.",
    "Incepe gratuit": "Почати безкоштовно",
    "Intreaba Forma": "Запитати Forma",
    "Istoric din contul tau": "Історія твого акаунта",
    "Jurnal rapid": "Швидкий журнал",
    "Mese si calorii": "Їжа та калорії",
    "Nume": "Ім'я",
    "Parola": "Пароль",
    "Plan alimentar 3/7 zile": "План харчування 3/7 днів",
    "Planuri": "Плани",
    "Planul tau de sala": "Твій план тренувань",
    "Profil": "Профіль",
    "Raport saptamanal": "Тижневий звіт",
    "Salveaza masa": "Зберегти їжу",
    "Setari aplicatie": "Налаштування",
    "Termeni": "Умови",
    "Vezi abonamentul": "Переглянути підписку",
  },
};

const dashboardTextTranslations: Record<Language, Record<string, string>> = {
  de: {
    "Ai salvat": "Du hast gespeichert",
    "Baza si forta; pauze 90-150 sec, progres pe greutati.": "Basis und Kraft; 90-150 Sek. Pausen, Fortschritt beim Gewicht.",
    "Calorii": "Kalorien",
    "Consumate azi": "Heute konsumiert",
    "Dupa salvare, planul tau alimentar apare aici.": "Nach dem Speichern erscheint dein Essensplan hier.",
    "Fara plan activ": "Kein aktiver Plan",
    "Genereaza un plan Premium": "Premium-Plan generieren",
    "LUNI": "MONTAG",
    "MIERCURI": "MITTWOCH",
    "Posterior chain si umeri; pauze 90-150 sec, progres pe greutati.": "Posterior Chain und Schultern; 90-150 Sek. Pausen, Fortschritt beim Gewicht.",
    "Plan alimentar activ": "Aktiver Essensplan",
    "Plan sala": "Trainingsplan",
    "Profil activ": "Aktives Profil",
    "Proteine": "Protein",
    "Sala saptamana": "Training diese Woche",
    "Tinta ta este": "Dein Ziel ist",
    "Urmatoarea masa": "Naechste Mahlzeit",
    "VINERI": "FREITAG",
    "Vezi planul complet": "Ganzen Plan ansehen",
    "Volum moderat si control; pauze 90-150 sec, progres pe greutati.": "Moderates Volumen und Kontrolle; 90-150 Sek. Pausen, Fortschritt beim Gewicht.",
    "calorii": "Kalorien",
    "carbohidrati": "Kohlenhydrate",
    "crestere masa": "Muskelaufbau",
    "din": "von",
    "grasimi": "Fett",
    "kcal ramase": "kcal uebrig",
    "mentinere": "Erhaltung",
    "mese azi": "Mahlzeiten heute",
    "planificate": "geplant",
    "progres azi": "Fortschritt heute",
    "proteine": "Protein",
    "ramase": "uebrig",
    "slabire": "Abnehmen",
    "tinta": "Ziel",
  },
  en: {
    "Ai salvat": "You saved",
    "Baza si forta; pauze 90-150 sec, progres pe greutati.": "Base and strength; 90-150 sec rests, progress on weights.",
    "Calorii": "Calories",
    "Consumate azi": "Consumed today",
    "Dupa salvare, planul tau alimentar apare aici.": "After saving, your meal plan appears here.",
    "Fara plan activ": "No active plan",
    "Genereaza un plan Premium": "Generate a Premium plan",
    "LUNI": "MONDAY",
    "MIERCURI": "WEDNESDAY",
    "Posterior chain si umeri; pauze 90-150 sec, progres pe greutati.": "Posterior chain and shoulders; 90-150 sec rests, progress on weights.",
    "Plan alimentar activ": "Active meal plan",
    "Plan sala": "Gym plan",
    "Profil activ": "Active profile",
    "Proteine": "Protein",
    "Sala saptamana": "Gym this week",
    "Tinta ta este": "Your target is",
    "Urmatoarea masa": "Next meal",
    "VINERI": "FRIDAY",
    "Vezi planul complet": "View full plan",
    "Volum moderat si control; pauze 90-150 sec, progres pe greutati.": "Moderate volume and control; 90-150 sec rests, progress on weights.",
    "calorii": "calories",
    "carbohidrati": "carbs",
    "crestere masa": "muscle gain",
    "din": "of",
    "grasimi": "fat",
    "kcal ramase": "kcal left",
    "mentinere": "maintenance",
    "mese azi": "meals today",
    "planificate": "planned",
    "progres azi": "today's progress",
    "proteine": "protein",
    "ramase": "left",
    "slabire": "weight loss",
    "tinta": "target",
  },
  es: {
    "Calorii": "Calorias",
    "Consumate azi": "Consumidas hoy",
    "Fara plan activ": "Sin plan activo",
    "Genereaza un plan Premium": "Generar plan Premium",
    "LUNI": "LUNES",
    "MIERCURI": "MIERCOLES",
    "Plan sala": "Plan de gimnasio",
    "Profil activ": "Perfil activo",
    "Proteine": "Proteina",
    "Sala saptamana": "Gimnasio esta semana",
    "Urmatoarea masa": "Proxima comida",
    "VINERI": "VIERNES",
    "calorii": "calorias",
    "crestere masa": "ganar masa",
    "progres azi": "progreso de hoy",
    "proteine": "proteina",
  },
  fr: {
    "Calorii": "Calories",
    "Consumate azi": "Consomme aujourd'hui",
    "Fara plan activ": "Aucun plan actif",
    "Genereaza un plan Premium": "Generer un plan Premium",
    "LUNI": "LUNDI",
    "MIERCURI": "MERCREDI",
    "Plan sala": "Plan sport",
    "Profil activ": "Profil actif",
    "Proteine": "Proteines",
    "Sala saptamana": "Sport cette semaine",
    "Urmatoarea masa": "Prochain repas",
    "VINERI": "VENDREDI",
    "calorii": "calories",
    "crestere masa": "prise de masse",
    "progres azi": "progres du jour",
    "proteine": "proteines",
  },
  it: {
    "Calorii": "Calorie",
    "Consumate azi": "Consumate oggi",
    "Fara plan activ": "Nessun piano attivo",
    "Genereaza un plan Premium": "Genera un piano Premium",
    "LUNI": "LUNEDI",
    "MIERCURI": "MERCOLEDI",
    "Plan sala": "Piano palestra",
    "Profil activ": "Profilo attivo",
    "Proteine": "Proteine",
    "Sala saptamana": "Palestra questa settimana",
    "Urmatoarea masa": "Prossimo pasto",
    "VINERI": "VENERDI",
    "calorii": "calorie",
    "crestere masa": "aumento massa",
    "progres azi": "progresso di oggi",
    "proteine": "proteine",
  },
  ro: {},
  ru: {
    "Calorii": "Калории",
    "Consumate azi": "Съедено сегодня",
    "Fara plan activ": "Нет активного плана",
    "Genereaza un plan Premium": "Создать Premium-план",
    "LUNI": "ПОНЕДЕЛЬНИК",
    "MIERCURI": "СРЕДА",
    "Plan sala": "План тренировок",
    "Profil activ": "Активный профиль",
    "Proteine": "Белок",
    "Sala saptamana": "Тренировки за неделю",
    "Urmatoarea masa": "Следующий прием пищи",
    "VINERI": "ПЯТНИЦА",
    "calorii": "калории",
    "crestere masa": "набор массы",
    "progres azi": "прогресс сегодня",
    "proteine": "белок",
  },
  uk: {
    "Calorii": "Калорії",
    "Consumate azi": "Спожито сьогодні",
    "Fara plan activ": "Немає активного плану",
    "Genereaza un plan Premium": "Створити Premium-план",
    "LUNI": "ПОНЕДІЛОК",
    "MIERCURI": "СЕРЕДА",
    "Plan sala": "План тренувань",
    "Profil activ": "Активний профіль",
    "Proteine": "Білок",
    "Sala saptamana": "Тренування за тиждень",
    "Urmatoarea masa": "Наступний прийом їжі",
    "VINERI": "П'ЯТНИЦЯ",
    "calorii": "калорії",
    "crestere masa": "набір маси",
    "progres azi": "прогрес сьогодні",
    "proteine": "білок",
  },
};

for (const language of languages) {
  Object.assign(staticTextTranslations[language.code], dashboardTextTranslations[language.code]);
}

const translationKeys = Object.keys(staticTextTranslations.en);
const reverseTranslations = new Map<string, string>();

for (const key of translationKeys) {
  reverseTranslations.set(key, key);
  for (const language of languages) {
    const translated = staticTextTranslations[language.code][key];
    if (translated) reverseTranslations.set(translated, key);
  }
}

function translateDynamicText(text: string, language: Language) {
  if (language === "ro") {
    return text
      .replace(/^Hi, (.+)$/u, "Salut, $1")
      .replace(/^Hallo, (.+)$/u, "Salut, $1")
      .replace(/, muscle gain/gu, ", crestere masa")
      .replace(/, Muskelaufbau/gu, ", crestere masa")
      .replace(/, weight loss/gu, ", slabire")
      .replace(/, Abnehmen/gu, ", slabire")
      .replace(/, maintenance/gu, ", mentinere")
      .replace(/, Erhaltung/gu, ", mentinere")
      .replace(/^Your target is (\d[\d.]*) kcal\. For today you have about (\d[\d.]*) kcal and (\d+)g protein left\.$/u, "Tinta ta este $1 kcal. Pentru azi mai ai aproximativ $2 kcal si $3g proteine.")
      .replace(/^Dein Ziel ist (\d[\d.]*) kcal\. Fuer heute hast du noch etwa (\d[\d.]*) kcal und (\d+)g Protein\.$/u, "Tinta ta este $1 kcal. Pentru azi mai ai aproximativ $2 kcal si $3g proteine.")
      .replace(/^(\d[\d.]*) kcal left$/u, "$1 kcal ramase")
      .replace(/^(\d[\d.]*) kcal uebrig$/u, "$1 kcal ramase")
      .replace(/^You saved (\d+) meals today: (\d+)g protein, (\d+)g carbs, (\d+)g fat\.$/u, "Ai salvat $1 mese azi: $2g proteine, $3g carbohidrati, $4g grasimi.")
      .replace(/^Du hast heute (\d+) Mahlzeiten gespeichert: (\d+)g Protein, (\d+)g Kohlenhydrate, (\d+)g Fett\.$/u, "Ai salvat $1 mese azi: $2g proteine, $3g carbohidrati, $4g grasimi.")
      .replace(/^of (\d[\d.]*) kcal$/u, "din $1 kcal")
      .replace(/^von (\d[\d.]*) kcal$/u, "din $1 kcal")
      .replace(/^of (\d+) planned$/u, "din $1 planificate")
      .replace(/^von (\d+) geplant$/u, "din $1 planificate")
      .replace(/^target (\d+)g$/u, "tinta $1g")
      .replace(/^Ziel (\d+)g$/u, "tinta $1g")
      .replace(/^until (.+)$/u, "pana la $1");
  }

  if (language === "de") {
    return text
      .replace(/^Salut, (.+)$/u, "Hallo, $1")
      .replace(/, crestere masa/gu, ", Muskelaufbau")
      .replace(/, slabire/gu, ", Abnehmen")
      .replace(/, mentinere/gu, ", Erhaltung")
      .replace(/^Tinta ta este (\d[\d.]*) kcal\. Pentru azi mai ai aproximativ (\d[\d.]*) kcal si (\d+)g proteine\.$/u, "Dein Ziel ist $1 kcal. Fuer heute hast du noch etwa $2 kcal und $3g Protein.")
      .replace(/^(\d[\d.]*) kcal ramase$/u, "$1 kcal uebrig")
      .replace(/^Ai salvat (\d+) mese azi: (\d+)g proteine, (\d+)g carbohidrati, (\d+)g grasimi\.$/u, "Du hast heute $1 Mahlzeiten gespeichert: $2g Protein, $3g Kohlenhydrate, $4g Fett.")
      .replace(/^din (\d[\d.]*) kcal$/u, "von $1 kcal")
      .replace(/^din (\d+) planificate$/u, "von $1 geplant")
      .replace(/^tinta (\d+)g$/u, "Ziel $1g")
      .replace(/^pana la (.+)$/u, "bis $1");
  }

  if (language !== "en") {
    return text
      .replace(/^Salut, (.+)$/u, "$1")
      .replace(/^Tinta ta este (\d[\d.]*) kcal\. Pentru azi mai ai aproximativ (\d[\d.]*) kcal si (\d+)g proteine\.$/u, "$1 kcal / $2 kcal / $3g")
      .replace(/^(\d[\d.]*) kcal ramase$/u, "$1 kcal")
      .replace(/^Ai salvat (\d+) mese azi: (\d+)g proteine, (\d+)g carbohidrati, (\d+)g grasimi\.$/u, "$1 / $2g / $3g / $4g");
  }

  return text
    .replace(/^Salut, (.+)$/u, "Hi, $1")
    .replace(/, crestere masa/gu, ", muscle gain")
    .replace(/, slabire/gu, ", weight loss")
    .replace(/, mentinere/gu, ", maintenance")
    .replace(/^Tinta ta este (\d[\d.]*) kcal\. Pentru azi mai ai aproximativ (\d[\d.]*) kcal si (\d+)g proteine\.$/u, "Your target is $1 kcal. For today you have about $2 kcal and $3g protein left.")
    .replace(/^(\d[\d.]*) kcal ramase$/u, "$1 kcal left")
    .replace(/^Ai salvat (\d+) mese azi: (\d+)g proteine, (\d+)g carbohidrati, (\d+)g grasimi\.$/u, "You saved $1 meals today: $2g protein, $3g carbs, $4g fat.")
    .replace(/^(\d+) \/ (\d+)$/u, "$1 / $2")
    .replace(/^(\d+)g \/ (\d+)g$/u, "$1g / $2g")
    .replace(/^din (\d[\d.]*) kcal$/u, "of $1 kcal")
    .replace(/^din (\d+) planificate$/u, "of $1 planned")
    .replace(/^tinta (\d+)g$/u, "target $1g")
    .replace(/^pana la (.+)$/u, "until $1");
}

function canAutoTranslate(text: string) {
  const trimmedText = text.trim();
  if (trimmedText.length < 2) return false;
  if (trimmedText === "Forma") return false;
  if (/^[\d\s.,:/+-]+$/u.test(trimmedText)) return false;
  if (/^[A-Z]{1,3}$/u.test(trimmedText)) return false;
  if (trimmedText.includes("@")) return false;
  return /[A-Za-zĂÂÎȘȚăâîșțА-Яа-яІіЇїЄєҐґ]/u.test(trimmedText);
}

function readTranslationCache(language: Language) {
  if (typeof window === "undefined") return {};

  try {
    const rawCache = window.localStorage.getItem(`${translationCachePrefix}${language}`);
    return rawCache ? (JSON.parse(rawCache) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeTranslationCache(language: Language, cache: Record<string, string>) {
  try {
    window.localStorage.setItem(`${translationCachePrefix}${language}`, JSON.stringify(cache));
  } catch {
  }
}

function clearLegacyTranslationCaches() {
  if (typeof window === "undefined") return;

  try {
    for (const key of Object.keys(window.localStorage)) {
      if (legacyTranslationCachePrefixes.some((prefix) => key.startsWith(prefix))) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
  }
}

function getKnownTranslation(text: string, language: Language, cache: Record<string, string>) {
  if (text === "Forma") return text;

  const key = reverseTranslations.get(text);
  const translated = key
    ? language === "ro"
      ? key
      : staticTextTranslations[language][key] ?? key
    : translateDynamicText(text, language);

  if (translated !== text) return translated;
  return cache[text] ?? null;
}

function setTextNodeValue(node: Text, originalText: string, translatedText: string) {
  const trimmedText = originalText.trim();
  node.nodeValue = originalText.replace(trimmedText, translatedText);
}

function translateTextNode(node: Text, language: Language, cache: Record<string, string>, missing: Set<string>) {
  const existingOriginal = originalTextNodes.get(node);
  const rawText = existingOriginal ?? node.nodeValue ?? "";
  const trimmedText = rawText.trim();
  if (!trimmedText) return;

  if (!existingOriginal) {
    originalTextNodes.set(node, rawText);
  }

  if (language === "ro") {
    if ((node.nodeValue ?? "") !== rawText) {
      node.nodeValue = rawText;
    }
    return;
  }

  if (!canAutoTranslate(trimmedText)) return;

  const translated = getKnownTranslation(trimmedText, language, cache);
  if (translated) {
    setTextNodeValue(node, rawText, translated);
    return;
  }

  missing.add(trimmedText);
}

function getOriginalAttribute(element: HTMLElement, attribute: "aria-label" | "placeholder" | "title") {
  const marker = `data-i18n-original-${attribute}`;
  const existing = element.getAttribute(marker);
  if (existing !== null) return existing;

  const value = element.getAttribute(attribute);
  if (value !== null) {
    element.setAttribute(marker, value);
  }

  return value;
}

function translateAttributes(root: ParentNode, language: Language, cache: Record<string, string>, missing: Set<string>) {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title]"));

  elements.forEach((element) => {
    (["placeholder", "aria-label", "title"] as const).forEach((attribute) => {
      const originalValue = getOriginalAttribute(element, attribute);
      const trimmedValue = originalValue?.trim();
      if (!originalValue || !trimmedValue || !canAutoTranslate(trimmedValue)) return;

      if (language === "ro") {
        element.setAttribute(attribute, originalValue);
        return;
      }

      const translated = getKnownTranslation(trimmedValue, language, cache);
      if (translated) {
        element.setAttribute(attribute, originalValue.replace(trimmedValue, translated));
        return;
      }

      missing.add(trimmedValue);
    });
  });
}

async function requestMissingTranslations(language: Language, texts: string[]) {
  if (texts.length === 0 || language === "ro") return;

  const newTexts = texts.filter((text) => {
    const key = `${language}:${text}`;
    if (inFlightTranslations.has(key)) return false;
    inFlightTranslations.add(key);
    return true;
  });

  if (newTexts.length === 0) return;

  try {
    const response = await fetch("/api/i18n/translate", {
      body: JSON.stringify({ language, texts: newTexts }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json()) as { translations?: Record<string, string> };
    if (!response.ok || !payload.translations) return;

    const cache = readTranslationCache(language);
    writeTranslationCache(language, { ...cache, ...payload.translations });
    translateDom(document.body, language);
    window.dispatchEvent(new Event(preferencesEvent));
  } catch {
  } finally {
    newTexts.forEach((text) => inFlightTranslations.delete(`${language}:${text}`));
  }
}

function translateDom(root: ParentNode, language: Language) {
  const cache = readTranslationCache(language);
  const missing = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "OPTION"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((node) => translateTextNode(node, language, cache, missing));
  translateAttributes(root, language, cache, missing);

  void requestMissingTranslations(language, Array.from(missing).slice(0, 80));
}

export function GlobalStaticTranslator() {
  const { language } = usePreferences();

  useEffect(() => {
    let frame = 0;
    clearLegacyTranslationCaches();

    function scheduleTranslate() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => translateDom(document.body, language));
    }

    scheduleTranslate();
    const observer = new MutationObserver(scheduleTranslate);
    observer.observe(document.body, {
      attributeFilter: ["aria-label", "placeholder", "title"],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language]);

  return null;
}

export function PreferencesControls() {
  const { copy, language, setLanguage, setTheme, theme } = usePreferences();

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Language"
        className="h-9 rounded-lg border border-[#ded9c8] bg-white px-2 text-xs font-black text-[#101211] outline-none"
        onChange={(event) => setLanguage(event.target.value as Language)}
        value={language}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
      <button
        aria-label="Theme"
        className="h-9 rounded-lg border border-[#ded9c8] bg-white px-3 text-xs font-black text-[#101211]"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        type="button"
      >
        {copy.theme[theme]}
      </button>
    </div>
  );
}

export function DesktopNavigation() {
  const pathname = usePathname();
  const { copy } = usePreferences();

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
            {copy.nav[item.href]}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}

export function MobileHeaderActions() {
  const { copy } = usePreferences();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        className="rounded-lg border border-[#ded9c8] px-3 py-2 text-xs font-black text-[#101211]"
        href="/profile"
      >
        {copy.profile}
      </Link>
      <Link
        className="rounded-lg bg-[#15171d] px-3 py-2 text-xs font-black text-white"
        href="/premium"
      >
        {copy.premium}
      </Link>
      <LogoutButton
        className="rounded-lg border border-[#ded9c8] px-3 py-2 text-xs font-black text-[#101211] transition hover:bg-[#f4f2e9]"
        label="Iesi"
      />
    </div>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { copy } = usePreferences();
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
            <span>{copy.nav[item.href]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
