import { getTranslations } from "next-intl/server";
import { db } from "@/lib/server/db";
import { requireAdminUser } from "@/lib/server/admin";

export default async function AdminPage() {
  const t = await getTranslations("admin");
  let accessError = "";

  try {
    await requireAdminUser();
  } catch (error) {
    accessError = error instanceof Error ? error.message : "Admin access required.";
  }

  if (accessError) {
    return (
      <main className="min-h-screen bg-[#f7f7f2] px-4 py-10 text-[#181a1f]">
        <section className="mx-auto max-w-xl rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-black">{t("accessTitle")}</h1>
          <p className="mt-3 text-sm font-semibold text-[#62695f]">{accessError}</p>
        </section>
      </main>
    );
  }

  const [
    usersCount,
    activeSubscriptions,
    mealLogsCount,
    activeMealPlansCount,
    workoutLogsCount,
    pushSubscriptionsCount,
    auditLogs,
  ] = await Promise.all([
    db.user.count(),
    db.subscription.count({
      where: {
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
      },
    }),
    db.mealLog.count(),
    db.mealPlan.count({
      where: {
        status: "ACTIVE",
      },
    }),
    db.workoutLog.count(),
    db.pushSubscription.count({
      where: {
        disabledAt: null,
      },
    }),
    db.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-10 text-[#181a1f]">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
          {t("kicker")}
        </p>
        <h1 className="mt-2 text-4xl font-black">{t("title")}</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: t("users"), value: usersCount },
            { label: t("premiumActive"), value: activeSubscriptions },
            { label: t("mealsSaved"), value: mealLogsCount },
            { label: t("activePlans"), value: activeMealPlansCount },
            { label: t("workoutsLogged"), value: workoutLogsCount },
            { label: t("pushDevices"), value: pushSubscriptionsCount },
          ].map((metric) => (
            <div className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm" key={metric.label}>
              <p className="text-sm font-black text-[#62695f]">{metric.label}</p>
              <p className="mt-2 text-3xl font-black">{metric.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-4 rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">{t("recentAudit")}</h2>
          <div className="mt-4 grid gap-3">
            {auditLogs.length === 0 ? (
              <p className="rounded-lg bg-[#fbfaf4] p-4 text-sm font-semibold text-[#62695f]">
                {t("noAudit")}
              </p>
            ) : (
              auditLogs.map((log) => (
                <article className="rounded-lg bg-[#fbfaf4] p-4" key={log.id}>
                  <p className="font-black">{log.action}</p>
                  <p className="text-sm text-[#62695f]">{log.createdAt.toISOString()}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
