import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f2] px-4 py-10 text-[#181a1f]">
      <section className="mx-auto max-w-3xl rounded-lg border border-[#ded9c8] bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
          legal
        </p>
        <h1 className="mt-2 text-4xl font-black">Termeni de utilizare</h1>
        <div className="mt-6 grid gap-4 text-sm font-semibold leading-7 text-[#555d52]">
          <p>
            Forma este un instrument de organizare pentru nutritie, antrenamente si progres.
            Estimarile de calorii, macro-uri si recomandarile AI sunt orientative.
          </p>
          <p>
            Aplicatia nu inlocuieste un medic, nutritionist, antrenor calificat sau evaluare
            medicala. Pentru durere, simptome, sarcina, boli cronice sau istoric de tulburari
            alimentare, cere ajutor calificat.
          </p>
          <p>
            Accesul Premium se acorda doar dupa confirmarea reala a platii prin procesatorul
            de plati configurat.
          </p>
        </div>
        <Link className="mt-6 inline-flex font-black text-[#123f31]" href="/">
          Inapoi la Forma
        </Link>
      </section>
    </main>
  );
}
