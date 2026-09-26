import type { FoodLogEntry } from "@/features/food-log/food-log";

const storageKey = "forma.food-log.v1";

export function readFoodLogSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(storageKey) ?? "[]";
}

export function readFoodLogEntries(): FoodLogEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue) as FoodLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFoodLogEntries(entries: FoodLogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(entries));
}
