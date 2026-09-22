"use client";

import { useEffect, useState } from "react";
import { type FoodEstimate, type FoodLogEntry } from "@/features/food-log/food-log";

function MacroLine({ estimate }: { estimate: FoodEstimate }) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="rounded-lg bg-[#fbfaf4] p-3">
        <p className="text-xs font-black text-[#62695f]">Kcal</p>
        <p className="mt-1 text-lg font-black">{estimate.totals.calories}</p>
      </div>
      <div className="rounded-lg bg-[#fbfaf4] p-3">
        <p className="text-xs font-black text-[#62695f]">Prot.</p>
        <p className="mt-1 text-lg font-black">{estimate.totals.proteinGrams}g</p>
      </div>
      <div className="rounded-lg bg-[#fbfaf4] p-3">
        <p className="text-xs font-black text-[#62695f]">Carb.</p>
        <p className="mt-1 text-lg font-black">{estimate.totals.carbGrams}g</p>
      </div>
      <div className="rounded-lg bg-[#fbfaf4] p-3">
        <p className="text-xs font-black text-[#62695f]">Gras.</p>
        <p className="mt-1 text-lg font-black">{estimate.totals.fatGrams}g</p>
      </div>
    </div>
  );
}

export function FoodLogPanel() {
  const [rawText, setRawText] = useState("");
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [status, setStatus] = useState("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      try {
        const response = await fetch("/api/food-log");
        const payload = (await response.json()) as { entries?: FoodLogEntry[] };
        if (isMounted) {
          setEntries(payload.entries ?? []);
        }
      } catch {
        if (isMounted) {
          setEntries([]);
        }
      }
    }

    void loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  async function estimateMeal() {
    const mealText = rawText.trim();
    if (mealText.length < 3 || isEstimating) return;

    setIsEstimating(true);
    setStatus("Forma estimeaza masa...");
    setEstimate(null);

    try {
      const response = await fetch("/api/ai/food-estimate", {
        body: JSON.stringify({ mealText }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { estimate?: FoodEstimate; error?: string };

      if (!response.ok || !payload.estimate) {
        throw new Error(payload.error ?? "Nu am putut estima masa.");
      }

      setEstimate(payload.estimate);
      setStatus("Estimare pregatita. Verifica portiile inainte sa salvezi.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare necunoscuta.");
    } finally {
      setIsEstimating(false);
    }
  }

  async function saveEntry() {
    if (!estimate || rawText.trim().length < 3) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/food-log", {
        body: JSON.stringify({
          estimate,
          rawText: rawText.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { entry?: FoodLogEntry; error?: string };

      if (!response.ok || !payload.entry) {
        throw new Error(payload.error ?? "Masa nu a putut fi salvata.");
      }

      setEntries((current) => [payload.entry as FoodLogEntry, ...current].slice(0, 20));
      setRawText("");
      setEstimate(null);
      setStatus("Masa salvata pe contul tau.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare necunoscuta.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Jurnal rapid</h2>
        <label className="mt-4 block text-sm font-black text-[#555d52]" htmlFor="meal">
          Ce ai mancat?
        </label>
        <textarea
          className="mt-2 min-h-36 w-full resize-none rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-4 text-sm outline-none focus:border-[#123f31]"
          id="meal"
          onChange={(event) => {
            setRawText(event.target.value);
            setEstimate(null);
            setStatus("");
          }}
          placeholder="Ex: 2 oua, o felie de paine, branza si cafea cu lapte"
          value={rawText}
        />

        {estimate ? (
          <div className="mt-4 rounded-lg border border-[#e6e1d1] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#527b20]">Estimare AI</p>
              <span className="rounded-md bg-[#c8ff55] px-3 py-1 text-xs font-black">
                {estimate.confidence}
              </span>
            </div>
            <MacroLine estimate={estimate} />
            <p className="mt-3 text-sm leading-6 text-[#62695f]">{estimate.notes}</p>
          </div>
        ) : null}

        {status ? (
          <p className="mt-3 rounded-lg bg-[#fbfaf4] p-3 text-sm font-semibold text-[#62695f]">
            {status}
          </p>
        ) : null}

        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-[#c8ff55] px-4 py-3 text-left text-sm font-black text-[#101211] shadow-sm transition hover:bg-[#b9f242] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={rawText.trim().length < 3 || isEstimating}
          onClick={estimateMeal}
          type="button"
        >
          {isEstimating ? "Se estimeaza..." : "Estimeaza cu Forma AI"}
        </button>

        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-left text-sm font-black text-white shadow-sm transition hover:bg-[#252832] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!estimate || isSaving}
          onClick={saveEntry}
          type="button"
        >
          {isSaving ? "Se salveaza..." : "Salveaza masa"}
        </button>
      </section>

      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Istoric din contul tau</h2>
        <div className="mt-4 grid gap-3">
          {entries.length === 0 ? (
            <p className="rounded-lg bg-[#fbfaf4] p-4 text-sm font-semibold text-[#62695f]">
              Inca nu ai mese salvate pe contul acesta. Istoricul este separat pentru fiecare user.
            </p>
          ) : (
            entries.map((entry) => (
              <article className="rounded-lg bg-[#fbfaf4] p-4" key={entry.id}>
                <p className="text-sm font-black text-[#527b20]">
                  {entry.totals.calories} kcal - {entry.totals.proteinGrams}g proteine
                </p>
                <h3 className="mt-2 font-black">{entry.rawText}</h3>
                <p className="mt-2 text-sm leading-6 text-[#656b62]">
                  {entry.items.map((item) => `${item.name} (${item.portion})`).join(", ")}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
