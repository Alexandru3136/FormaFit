import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-10 text-[#181a1f]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#ded9c8] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
          {t("kicker")}
        </p>
        <h1 className="mt-2 text-4xl font-black">{t("title")}</h1>
        <div className="mt-6 grid gap-4 text-sm font-semibold leading-7 text-[#555d52]">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>
        <Link className="mt-6 inline-flex font-black text-[#123f31]" href="/">
          {t("back")}
        </Link>
      </section>
    </main>
  );
}
