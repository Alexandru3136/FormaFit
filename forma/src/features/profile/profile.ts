import type { ActivityLevel, CalorieInput, Goal, Sex } from "@/features/nutrition/calorie-calculator";

export type TrainingPlace = "gym" | "home" | "mixed";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type TrainingDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type UserProfile = CalorieInput & {
  name: string;
  trainingDaysPerWeek: number;
  availableTrainingDays: TrainingDay[];
  trainingPlace: TrainingPlace;
  experienceLevel: ExperienceLevel;
  foodPreferences: string;
  restrictions: string;
};

export type ProfileValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const defaultProfile: UserProfile = {
  name: "Ana",
  sex: "female",
  age: 29,
  heightCm: 168,
  weightKg: 72,
  activityLevel: "moderate",
  goal: "lose",
  trainingDaysPerWeek: 3,
  availableTrainingDays: ["monday", "wednesday", "friday"],
  trainingPlace: "gym",
  experienceLevel: "beginner",
  foodPreferences: "pui, oua, iaurt, orez, salate",
  restrictions: "fara restrictii",
};

export const sexOptions: Sex[] = ["female", "male"];
export const goalOptions: Goal[] = ["lose", "maintain", "gain"];
export const activityOptions: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very-active",
];
export const trainingPlaceOptions: TrainingPlace[] = ["gym", "home", "mixed"];
export const experienceOptions: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
export const trainingDayOptions: TrainingDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function trainingDayLabel(day: TrainingDay) {
  return {
    friday: "Vineri",
    monday: "Luni",
    saturday: "Sambata",
    sunday: "Duminica",
    thursday: "Joi",
    tuesday: "Marti",
    wednesday: "Miercuri",
  }[day];
}

export function trainingPlaceLabel(place: TrainingPlace) {
  return {
    gym: "Sala",
    home: "Acasa",
    mixed: "Mixt",
  }[place];
}

export function experienceLabel(level: ExperienceLevel) {
  return {
    beginner: "Incepator",
    intermediate: "Intermediar",
    advanced: "Avansat",
  }[level];
}

export function validateProfile(profile: UserProfile): ProfileValidationResult {
  const errors: string[] = [];

  if (profile.name.trim().length < 2) errors.push("Numele trebuie sa aiba cel putin 2 caractere.");
  if (profile.age < 14 || profile.age > 90) errors.push("Varsta trebuie sa fie intre 14 si 90.");
  if (profile.heightCm < 120 || profile.heightCm > 230) errors.push("Inaltimea trebuie sa fie intre 120 si 230 cm.");
  if (profile.weightKg < 35 || profile.weightKg > 250) errors.push("Greutatea trebuie sa fie intre 35 si 250 kg.");
  if (profile.trainingDaysPerWeek < 1 || profile.trainingDaysPerWeek > 7) {
    errors.push("Zilele de antrenament trebuie sa fie intre 1 si 7.");
  }
  if (profile.availableTrainingDays.length < profile.trainingDaysPerWeek) {
    errors.push("Alege cel putin atatea zile disponibile cate zile de sala vrei pe saptamana.");
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
}
