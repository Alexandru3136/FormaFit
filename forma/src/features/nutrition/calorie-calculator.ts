export type Sex = "female" | "male";
export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";

export type CalorieInput = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type CalorieTargets = {
  bmr: number;
  tdee: number;
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
};

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

const goalAdjustments: Record<Goal, number> = {
  lose: -0.15,
  maintain: 0,
  gain: 0.1,
};

const proteinPerKg: Record<Goal, number> = {
  lose: 1.9,
  maintain: 1.7,
  gain: 2,
};

function roundToNearest(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function calculateBmr(input: CalorieInput) {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return Math.round(input.sex === "male" ? base + 5 : base - 161);
}

export function calculateTargets(input: CalorieInput): CalorieTargets {
  const bmr = calculateBmr(input);
  const tdee = Math.round(bmr * activityMultipliers[input.activityLevel]);
  const calories = roundToNearest(tdee * (1 + goalAdjustments[input.goal]), 10);
  const proteinGrams = Math.round(input.weightKg * proteinPerKg[input.goal]);
  const fatGrams = Math.round((calories * 0.28) / 9);
  const carbGrams = Math.max(0, Math.round((calories - proteinGrams * 4 - fatGrams * 9) / 4));

  return {
    bmr,
    tdee,
    calories,
    proteinGrams,
    fatGrams,
    carbGrams,
  };
}

export function goalLabel(goal: Goal) {
  return {
    lose: "Slabire",
    maintain: "Mentinere",
    gain: "Crestere masa",
  }[goal];
}

export function activityLabel(activityLevel: ActivityLevel) {
  return {
    sedentary: "Sedentar",
    light: "Activitate usoara",
    moderate: "Activitate moderata",
    active: "Activ",
    "very-active": "Foarte activ",
  }[activityLevel];
}
