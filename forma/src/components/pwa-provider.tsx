"use client";

import { useEffect } from "react";

export function PwaProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // PWA installability should not block the app if registration fails.
    });
  }, []);

  return null;
}
