export const userSnapshot = {
  name: "Ana",
  goal: "Slabire usoara",
  caloriesTarget: 1850,
  caloriesLogged: 1230,
  proteinTarget: 125,
  proteinLogged: 78,
  waterTargetMl: 2500,
  waterLoggedMl: 1600,
};

export const dailyStats = [
  { label: "Calorii ramase", value: "620", helper: "din 1,850 kcal" },
  { label: "Proteine", value: "78g", helper: "tinta 125g" },
  { label: "Apa", value: "1.6L", helper: "inca 900ml" },
];

export const quickActions = [
  "Adauga masa",
  "Fa-mi cina",
  "Incepe sala",
  "Coach rapid",
];

export const mealIdeas = [
  {
    title: "Cina din ce ai acasa",
    detail: "Pui, orez, rosii, iaurt",
    meta: "510 kcal - 43g proteine",
  },
  {
    title: "Mic dejun simplu",
    detail: "Oua, paine, branza, castraveti",
    meta: "420 kcal - 29g proteine",
  },
];

export const workoutPlan = [
  { day: "Luni", focus: "Full-body", detail: "Genuflexiuni - Impins - Ramat" },
  { day: "Miercuri", focus: "Upper", detail: "Piept - Spate - Umeri - Brate" },
  { day: "Vineri", focus: "Lower", detail: "Picioare - Fesieri - Abdomen" },
];

export const buildSteps = [
  "Structura curata pentru features, componente si servicii server-side.",
  "Calculator calorii si onboarding cu validari clare.",
  "AI prin OmniRoute doar pe server, cu raspunsuri JSON controlate.",
  "Premium activat doar prin webhook Stripe verificat.",
];

export const onboardingFields = [
  "Obiectiv: slabire, mentinere sau crestere",
  "Greutate, inaltime, varsta si sex",
  "Nivel de activitate si zile de sala",
  "Preferinte alimentare si restrictii",
  "Echipament: sala, acasa sau mixt",
];

export const exerciseLibrary = [
  {
    name: "Genuflexiuni",
    muscles: "Picioare, fesieri, trunchi",
    cue: "Spatele stabil, genunchii urmaresc directia varfurilor.",
  },
  {
    name: "Ramat la cablu",
    muscles: "Spate, biceps",
    cue: "Trage coatele inapoi si mentine pieptul deschis.",
  },
  {
    name: "Impins cu gantere",
    muscles: "Piept, umeri, triceps",
    cue: "Controleaza coborarea si nu bloca umerii sus.",
  },
];

export const coachMessages = [
  {
    role: "Forma",
    text: "Mai ai loc pentru o cina bogata in proteine. Pot face variante rapide din ce ai in frigider.",
  },
  {
    role: "Tu",
    text: "Am oua, ton, rosii si iaurt. Vreau ceva sub 550 kcal.",
  },
  {
    role: "Forma",
    text: "Alege salata cu ton, iaurt ca dressing si doua oua fierte. Ramai aproape de tinta si cresti proteinele.",
  },
];
