"use client";

import { useEffect, useState } from "react";

type MealIdea = {
  title: string;
  calories: number;
  proteinGrams: number;
  ingredients: string[];
  steps: string[];
  note: string;
};

type MealIdeasResponse = {
  ideas?: MealIdea[];
  quota?: MealIdeaQuota;
  error?: string;
};

type MealIdeaQuota = {
  isPremium: boolean;
  limit: number | null;
  remaining: number | null;
  used: number;
};

const examples = ["pui, orez, iaurt, rosii", "oua, branza, ton, avocado", "cartofi, curcan, salata"];

export function MealIdeasPanel() {
  const [ingredients, setIngredients] = useState("");
  const [ideas, setIdeas] = useState<MealIdea[]>([]);
  const [quota, setQuota] = useState<MealIdeaQuota | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadQuota() {
      try {
        const response = await fetch("/api/ai/meal-ideas");
        const payload = (await response.json()) as { quota?: MealIdeaQuota };
        if (isMounted && payload.quota) {
          setQuota(payload.quota);
        }
      } catch {
        if (isMounted) {
          setQuota(null);
        }
      }
    }

    void loadQuota();

    return () => {
      isMounted = false;
    };
  }, []);

  async function generateIdeas() {
    const trimmedIngredients = ingredients.trim();
    if (trimmedIngredients.length < 3 || isLoading || quota?.remaining === 0) return;

    setIsLoading(true);
    setStatus("Forma cauta variante potrivite profilului tau...");
    setIdeas([]);

    try {
      const response = await fetch("/api/ai/meal-ideas", {
        body: JSON.stringify({ ingredients: trimmedIngredients }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as MealIdeasResponse;

      if (!response.ok || !payload.ideas) {
        if (payload.quota) {
          setQuota(payload.quota);
        }
        throw new Error(payload.error ?? "Nu am putut genera idei de masa.");
      }

      setIdeas(payload.ideas);
      if (payload.quota) {
        setQuota(payload.quota);
      }
      setStatus(
        payload.quota?.isPremium
          ? "Am generat variante Premium pentru profilul tau."
          : `Generare folosita. Mai ai ${payload.quota?.remaining ?? 0} Free azi.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare necunoscuta.");
    } finally {
      setIsLoading(false);
    }
  }

  const quotaLabel = quota?.isPremium
    ? "Premium"
    : `Free: ${quota?.remaining ?? 2} generari ramase azi`;
  const isQuotaFinished = quota?.remaining === 0;

  return (
    <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black">Idei din ce ai acasa</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#62695f]">
            Scrie ingredientele disponibile, iar Forma genereaza mese potrivite cu
            profilul, obiectivul si restrictiile tale.
          </p>
        </div>
        <span className="w-fit rounded-lg bg-[#c8ff55] px-3 py-2 text-xs font-black text-[#101211]">
          {quotaLabel}
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {examples.map((example) => (
          <button
            className="shrink-0 rounded-lg border border-[#ded9c8] bg-[#fbfaf4] px-3 py-2 text-xs font-black text-[#4d554b] transition hover:border-[#123f31] hover:text-[#123f31]"
            key={example}
            onClick={() => setIngredients(example)}
            type="button"
          >
            {example}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-black text-[#555d52]" htmlFor="ingredients">
        Ce produse ai?
      </label>
      <textarea
        className="mt-2 min-h-28 w-full resize-none rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-4 text-sm font-semibold leading-6 outline-none focus:border-[#123f31]"
        id="ingredients"
        onChange={(event) => setIngredients(event.target.value)}
        placeholder="Ex: pui, orez, rosii, iaurt, castraveti..."
        value={ingredients}
      />

      <button
        className="mt-3 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#252832] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={ingredients.trim().length < 3 || isLoading || isQuotaFinished}
        onClick={generateIdeas}
        type="button"
      >
        {isLoading ? "Se genereaza..." : isQuotaFinished ? "Limita Free folosita azi" : "Genereaza idei"}
      </button>

      {status ? (
        <p className="mt-3 rounded-lg bg-[#fbfaf4] p-3 text-sm font-semibold text-[#62695f]">
          {status}
        </p>
      ) : null}

      {ideas.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ideas.map((idea) => (
            <article className="rounded-lg bg-[#fbfaf4] p-4" key={idea.title}>
              <p className="text-sm font-black text-[#527b20]">
                {idea.calories} kcal - {idea.proteinGrams}g proteine
              </p>
              <h3 className="mt-2 text-lg font-black">{idea.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#656b62]">
                {idea.ingredients.join(", ")}
              </p>
              <ol className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-[#384034]">
                {idea.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-3 text-sm leading-6 text-[#656b62]">{idea.note}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
