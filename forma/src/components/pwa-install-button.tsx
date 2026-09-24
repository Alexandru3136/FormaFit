"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const safariNavigator = navigator as NavigatorWithStandalone;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(safariNavigator.standalone);
}

export function PwaInstallButton() {
  const t = useTranslations("pwa");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const standalone = isStandalone();
      setInstalled(standalone);
      setShowIosHint(isIosDevice() && !standalone);
    });

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      setShowIosHint(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }

    setInstallPrompt(null);
  }

  if (installed) {
    return (
      <span className="rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 py-3 text-sm font-black text-[#123f31]">
        {t("installed")}
      </span>
    );
  }

  if (installPrompt) {
    return (
      <button
        className="rounded-lg bg-[#c8ff55] px-4 py-3 text-sm font-black text-[#101211] shadow-sm transition hover:bg-[#b9f242]"
        onClick={installApp}
        type="button"
      >
        {t("install")}
      </button>
    );
  }

  if (showIosHint) {
    return (
      <span className="rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 py-3 text-sm font-black text-[#123f31]">
        {t("iosHint")}
      </span>
    );
  }

  return null;
}
