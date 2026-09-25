import { getLocale, getTranslations } from "next-intl/server";
import { AppShell } from "@/components/app-shell";
import { LogoutButton } from "@/features/auth/logout-button";
import { AccountSettings } from "@/features/account/account-settings";
import { PreferencesControls } from "@/features/preferences/app-preferences";
import { defaultProfile } from "@/features/profile/profile";
import { ProfileForm } from "@/features/profile/profile-form";
import { db } from "@/lib/server/db";
import { toUserProfile } from "@/lib/server/profile";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
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
  const updatedAt = userWithProfile?.profile?.updatedAt;
  const tp = await getTranslations("pages");
  const t = await getTranslations("profilePage");
  const locale = await getLocale();

  return (
    <AppShell kicker={tp("profileKicker")} title={tp("profileTitle")}>
      <section className="mb-4 rounded-lg border border-[#ded9c8] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#527b20]">{t("sessionKicker")}</p>
            <h2 className="mt-1 text-xl font-black">{t("sessionTitle")}</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#62695f]">
              {t("sessionBody", { email: user.email })}
            </p>
          </div>
          <LogoutButton className="rounded-lg bg-[#15171d] px-5 py-3 text-left text-sm font-black text-white transition hover:bg-[#0b0d10] sm:min-w-40 sm:text-center" />
        </div>
      </section>

      <div className="mb-4 rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#527b20]">{t("checkinKicker")}</p>
        <h2 className="mt-2 text-xl font-black">{t("checkinTitle")}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#62695f]">
          {t("checkinBody")}
        </p>
        {updatedAt ? (
          <p className="mt-3 text-sm font-black text-[#101211]">
            {t("lastUpdate", {
              date: updatedAt.toLocaleDateString(locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
            })}
          </p>
        ) : null}
      </div>

      <ProfileForm initialProfile={profile} redirectTo="/profile" />
      <section className="mt-4 rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">{t("settingsTitle")}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#62695f]">
              {t("settingsBody")}
            </p>
          </div>
          <PreferencesControls />
        </div>
        <div className="mt-4 max-w-xs">
          <LogoutButton />
        </div>
      </section>
      <AccountSettings />
    </AppShell>
  );
}
