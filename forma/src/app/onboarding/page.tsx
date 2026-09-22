import { AppShell } from "@/components/app-shell";
import { defaultProfile } from "@/features/profile/profile";
import { ProfileForm } from "@/features/profile/profile-form";
import { db } from "@/lib/server/db";
import { toUserProfile } from "@/lib/server/profile";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userWithProfile = await db.user.findUnique({
    include: {
      profile: true,
    },
    where: {
      id: user.id,
    },
  });

  const profile = userWithProfile
    ? toUserProfile(userWithProfile) ?? { ...defaultProfile, name: user.name }
    : { ...defaultProfile, name: user.name };

  return (
    <AppShell kicker="profil initial" title="Spune-ne tinta ta">
      <ProfileForm initialProfile={profile} />
    </AppShell>
  );
}
