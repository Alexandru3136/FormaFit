"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

export function PushSetup() {
  const [status, setStatus] = useState("Verificam suportul pentru notificari...");
  const [publicKey, setPublicKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("Browserul acesta nu suporta notificari push PWA.");
        return;
      }

      try {
        const response = await fetch("/api/push/subscription");
        const payload = (await response.json()) as { activeCount?: number; publicKey?: string };

        if (!isMounted) return;

        setPublicKey(payload.publicKey ?? "");
        setStatus(
          payload.activeCount
            ? `Notificarile sunt active pe ${payload.activeCount} dispozitiv(e).`
            : "Notificarile nu sunt active pe acest cont.",
        );
      } catch {
        if (isMounted) {
          setStatus("Nu am putut verifica notificarile.");
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  async function enableNotifications() {
    if (!publicKey || isLoading) return;

    setIsLoading(true);
    setStatus("Cerem permisiunea pentru notificari...");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("Notificarile nu au fost permise.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToUint8Array(publicKey),
        userVisibleOnly: true,
      });

      const response = await fetch("/api/push/subscription", {
        body: JSON.stringify({ subscription }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Subscription nu a putut fi salvata.");
      }

      setStatus("Notificarile sunt activate pentru acest dispozitiv.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nu am putut activa notificarile.");
    } finally {
      setIsLoading(false);
    }
  }

  const missingVapidKey = !publicKey;

  return (
    <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
        PWA push
      </p>
      <h2 className="mt-2 text-2xl font-black">Notificari pe dispozitiv</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#62695f]">{status}</p>
      {missingVapidKey ? (
        <p className="mt-3 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-3 text-sm font-semibold leading-6 text-[#5d531c]">
          Pentru push real trebuie configurata cheia publica VAPID in
          NEXT_PUBLIC_VAPID_PUBLIC_KEY si cheia privata pe server.
        </p>
      ) : null}
      <button
        className="mt-4 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading || missingVapidKey}
        onClick={enableNotifications}
        type="button"
      >
        {isLoading ? "Se activeaza..." : "Activeaza notificari"}
      </button>
    </section>
  );
}
