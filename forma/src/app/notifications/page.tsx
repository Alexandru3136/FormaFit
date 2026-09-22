import { AppShell } from "@/components/app-shell";
import { PushSetup } from "@/features/notifications/push-setup";
import { notificationTemplates } from "@/features/notifications/notification-templates";
import { getCurrentUser } from "@/lib/server/session";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell kicker="notificari" title="Ton prietenos, nu presiune">
      <div className="mb-4">
        <PushSetup />
      </div>
      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <p className="max-w-2xl text-sm leading-6 text-[#62695f]">
          Aceste template-uri vor fi folosite de engine-ul de notificari. Userul va
          putea alege frecventa: bland, normal sau ambitios.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {notificationTemplates.map((template) => (
            <article className="rounded-lg bg-[#fbfaf4] p-4" key={template.id}>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#527b20]">
                {template.tone}
              </p>
              <h2 className="mt-2 text-lg font-black">{template.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#62695f]">{template.body}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
