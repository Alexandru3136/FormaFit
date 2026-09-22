"use client";

import { useState } from "react";

export function BillingButton() {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function startCheckout() {
    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Nu am putut porni checkout-ul.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare necunoscuta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        className="min-h-12 w-full rounded-lg bg-[#c8ff55] px-4 py-3 text-left text-sm font-black text-[#101211] transition hover:bg-[#b9f242] disabled:opacity-60"
        disabled={isLoading}
        onClick={startCheckout}
        type="button"
      >
        {isLoading ? "Se pregateste checkout..." : "Activeaza Premium"}
      </button>
      {status ? <p className="mt-3 text-sm font-semibold text-[#ffeaa5]">{status}</p> : null}
    </div>
  );
}
