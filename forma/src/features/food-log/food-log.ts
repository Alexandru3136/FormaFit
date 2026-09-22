export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodEstimateItem = {
  name: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
};

export type FoodEstimate = {
  mealType: MealType;
  confidence: "low" | "medium" | "high";
  notes: string;
  items: FoodEstimateItem[];
  totals: {
    calories: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
  };
};

export type FoodLogEntry = FoodEstimate & {
  id: string;
  rawText: string;
  createdAt: string;
};

const foodDictionary: Record<string, FoodEstimateItem> = {
  oua: {
    name: "Oua",
    portion: "2 bucati",
    calories: 150,
    proteinGrams: 13,
    carbGrams: 1,
    fatGrams: 10,
  },
  paine: {
    name: "Paine",
    portion: "1 felie",
    calories: 90,
    proteinGrams: 3,
    carbGrams: 17,
    fatGrams: 1,
  },
  branza: {
    name: "Branza",
    portion: "40g",
    calories: 120,
    proteinGrams: 8,
    carbGrams: 1,
    fatGrams: 9,
  },
  pui: {
    name: "Piept de pui",
    portion: "150g",
    calories: 250,
    proteinGrams: 46,
    carbGrams: 0,
    fatGrams: 5,
  },
  orez: {
    name: "Orez gatit",
    portion: "150g",
    calories: 195,
    proteinGrams: 4,
    carbGrams: 42,
    fatGrams: 1,
  },
  iaurt: {
    name: "Iaurt grecesc",
    portion: "150g",
    calories: 110,
    proteinGrams: 15,
    carbGrams: 6,
    fatGrams: 3,
  },
  ton: {
    name: "Ton",
    portion: "1 conserva",
    calories: 160,
    proteinGrams: 35,
    carbGrams: 0,
    fatGrams: 2,
  },
  rosii: {
    name: "Rosii",
    portion: "150g",
    calories: 30,
    proteinGrams: 1,
    carbGrams: 6,
    fatGrams: 0,
  },
};

function inferMealType(text: string): MealType {
  if (text.includes("dejun") || text.includes("mic dejun")) return "breakfast";
  if (text.includes("pranz")) return "lunch";
  if (text.includes("cina")) return "dinner";
  return "snack";
}

function sumItems(items: FoodEstimateItem[]) {
  return items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      proteinGrams: totals.proteinGrams + item.proteinGrams,
      carbGrams: totals.carbGrams + item.carbGrams,
      fatGrams: totals.fatGrams + item.fatGrams,
    }),
    { calories: 0, proteinGrams: 0, carbGrams: 0, fatGrams: 0 },
  );
}

export function estimateFoodFromText(rawText: string): FoodEstimate {
  const normalized = rawText.toLowerCase();
  const items = Object.entries(foodDictionary)
    .filter(([keyword]) => normalized.includes(keyword))
    .map(([, item]) => item);

  const fallbackItems =
    items.length > 0
      ? items
      : [
          {
            name: "Masa descrisa liber",
            portion: "portie medie",
            calories: 450,
            proteinGrams: 25,
            carbGrams: 45,
            fatGrams: 15,
          },
        ];

  return {
    confidence: items.length > 0 ? "medium" : "low",
    items: fallbackItems,
    mealType: inferMealType(normalized),
    notes:
      items.length > 0
        ? "Estimare mock pe baza alimentelor recunoscute. AI-ul real va verifica portiile."
        : "Nu am recunoscut ingrediente clare, asa ca am folosit o portie medie orientativa.",
    totals: sumItems(fallbackItems),
  };
}

export function createFoodLogEntry(rawText: string, estimate: FoodEstimate): FoodLogEntry {
  return {
    ...estimate,
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
    rawText,
  };
}
