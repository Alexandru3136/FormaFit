"use client";

import { useEffect, useMemo, useState } from "react";
import type { FoodLogEntry } from "@/features/food-log/food-log";

export function FoodLogSummary() {
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);

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

  const totals = useMemo(
    () =>
      entries.reduce(
        (sum, entry) => ({
          calories: sum.calories + entry.totals.calories,
          proteinGrams: sum.proteinGrams + entry.totals.proteinGrams,
        }),
        { calories: 0, proteinGrams: 0 },
      ),
    [entries],
  );

  return (
    <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Mese salvate azi</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-[#fbfaf4] p-4">
          <p className="text-sm font-black text-[#62695f]">Intrari</p>
          <p className="mt-2 text-2xl font-black">{entries.length}</p>
        </div>
        <div className="rounded-lg bg-[#fbfaf4] p-4">
          <p className="text-sm font-black text-[#62695f]">Calorii</p>
          <p className="mt-2 text-2xl font-black">{totals.calories}</p>
        </div>
        <div className="rounded-lg bg-[#fbfaf4] p-4">
          <p className="text-sm font-black text-[#62695f]">Proteine</p>
          <p className="mt-2 text-2xl font-black">{totals.proteinGrams}g</p>
        </div>
      </div>
    </section>
  );
}
