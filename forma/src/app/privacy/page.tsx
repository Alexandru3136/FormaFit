import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-10 text-[#181a1f]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#ded9c8] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
          privacy
        </p>
        <h1 className="mt-2 text-4xl font-black">Politica de confidentialitate</h1>
        <div className="mt-6 grid gap-4 text-sm font-semibold leading-7 text-[#555d52]">
          <p>
            Forma salveaza datele necesare pentru cont: nume, email, parola hashuita, profil,
            mese, planuri, progres si status abonament.
          </p>
          <p>
            Cheile API si secretele de plata raman pe server. Accesul Premium este verificat
            prin webhook semnat, nu prin starea unui buton din browser.
          </p>
          <p>
            Utilizatorul poate cere stergerea contului din profil. Pentru productie, aceasta
            pagina trebuie completata cu operatorul legal, perioada de retentie si contactul
            responsabilului de date.
          </p>
        </div>
        <Link className="mt-6 inline-flex font-black text-[#123f31]" href="/">
          Inapoi la Forma
        </Link>
      </section>
    </main>
  );
}
