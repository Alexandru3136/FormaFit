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

export function validateProfile(profile: UserProfile): ProfileValidationResult {
  const errors: string[] = [];

  if (profile.name.trim().length < 2) errors.push("nameMin");
  if (profile.age < 14 || profile.age > 90) errors.push("ageRange");
  if (profile.heightCm < 120 || profile.heightCm > 230) errors.push("heightRange");
  if (profile.weightKg < 35 || profile.weightKg > 250) errors.push("weightRange");
  if (profile.trainingDaysPerWeek < 1 || profile.trainingDaysPerWeek > 7) {
    errors.push("trainingDaysRange");
  }
  if (profile.availableTrainingDays.length < profile.trainingDaysPerWeek) {
    errors.push("availableDaysMin");
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
}
