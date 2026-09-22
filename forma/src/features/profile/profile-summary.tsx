import { calculateTargets, goalLabel } from "@/features/nutrition/calorie-calculator";
import type { UserProfile } from "@/features/profile/profile";

type ProfileSummaryProps = {
  consumedCalories?: number;
  consumedProteinGrams?: number;
  profile: UserProfile;
};

export function ProfileSummary({
  consumedCalories = 0,
  consumedProteinGrams = 0,
  profile,
}: ProfileSummaryProps) {
  const targets = calculateTargets(profile);
  const caloriesLeft = Math.max(0, targets.calories - consumedCalories);
  const proteinLeft = Math.max(0, targets.proteinGrams - consumedProteinGrams);

  return (
    <section className="rounded-lg bg-[#123f31] p-5 text-white">
      <p className="text-sm font-black text-[#c8ff55]">Profil activ</p>
      <h2 className="mt-3 text-2xl font-black">
        {profile.name}, {goalLabel(profile.goal).toLowerCase()}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#edf4e7]">
        Tinta ta este {targets.calories} kcal. Pentru azi mai ai aproximativ{" "}
        {caloriesLeft} kcal si {proteinLeft}g proteine.
      </p>
    </section>
  );
}
