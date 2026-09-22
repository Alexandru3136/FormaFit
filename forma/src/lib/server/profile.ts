import "server-only";

import type { Profile } from "@prisma/client";
import type { UserProfile } from "@/features/profile/profile";

type ProfileOwner = {
  name: string;
  profile: Profile | null;
};

export function toUserProfile(user: ProfileOwner): UserProfile | null {
  if (!user.profile) return null;

  return {
    activityLevel: user.profile.activityLevel as UserProfile["activityLevel"],
    age: user.profile.age,
    availableTrainingDays: user.profile.availableTrainingDays
      .split(",")
      .filter(Boolean) as UserProfile["availableTrainingDays"],
    experienceLevel: user.profile.experienceLevel as UserProfile["experienceLevel"],
    foodPreferences: user.profile.foodPreferences,
    goal: user.profile.goal as UserProfile["goal"],
    heightCm: user.profile.heightCm,
    name: user.name,
    restrictions: user.profile.restrictions,
    sex: user.profile.sex as UserProfile["sex"],
    trainingDaysPerWeek: user.profile.trainingDaysPerWeek,
    trainingPlace: user.profile.trainingPlace as UserProfile["trainingPlace"],
    weightKg: user.profile.weightKg,
  };
}
