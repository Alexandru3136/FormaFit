import { defaultProfile, type UserProfile, validateProfile } from "@/features/profile/profile";

const storageKey = "forma.profile.v1";

export function readStoredProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return defaultProfile;

    const parsed = JSON.parse(rawValue) as UserProfile;
    const merged = {
      ...defaultProfile,
      ...parsed,
      availableTrainingDays: parsed.availableTrainingDays ?? defaultProfile.availableTrainingDays,
    };
    return validateProfile(merged).isValid ? merged : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function writeStoredProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(profile));
}
