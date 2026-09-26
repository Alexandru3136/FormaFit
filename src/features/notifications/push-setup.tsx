"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

export function PushSetup() {
  const t = useTranslations("push");
  const [status, setStatus] = useState(t("checkingSupport"));
  const [publicKey, setPublicKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus(t("unsupported"));
        return;
      }

      try {
        const response = await fetch("/api/push/subscription");
        const payload = (await response.json()) as { activeCount?: number; publicKey?: string };

        if (!isMounted) return;

        setPublicKey(payload.publicKey ?? "");
        setStatus(
          payload.activeCount
            ? t("activeOnDevices", { count: payload.activeCount })
            : t("notActive"),
        );
      } catch {
        if (isMounted) {
          setStatus(t("couldNotCheck"));
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, [t]);

  async function enableNotifications() {
    if (!publicKey || isLoading) return;

    setIsLoading(true);
    setStatus(t("requesting"));

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(t("notAllowed"));
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
        throw new Error(payload.error ?? t("saveFailed"));
      }

      setStatus(t("enabledDevice"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("enableFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  const missingVapidKey = !publicKey;

  return (
    <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
        {t("kicker")}
      </p>
      <h2 className="mt-2 text-2xl font-black">{t("title")}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#62695f]">{status}</p>
      {missingVapidKey ? (
        <p className="mt-3 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-3 text-sm font-semibold leading-6 text-[#5d531c]">
          {t("missingVapid")}
        </p>
      ) : null}
      <button
        className="mt-4 min-h-12 w-full rounded-lg bg-[#15171d] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isLoading || missingVapidKey}
        onClick={enableNotifications}
        type="button"
      >
        {isLoading ? t("enabling") : t("enable")}
      </button>
    </section>
  );
}
