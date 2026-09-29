import { useSyncExternalStore } from "react";

// Whether she chose "Skip" on today's Daily Plan card. Kept on this phone,
// per card day, so the card comes back tomorrow. Skipping counts the same as
// having made a plan: the waiting-for-reflection card takes its place.
const KEY = "becomely:daily-plan-skipped";
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function skipDailyPlan(cardDay: string) {
  try {
    localStorage.setItem(KEY, cardDay);
  } catch {
    // Storage blocked: it's skipped until she leaves this screen.
  }
  skippedInMemory = cardDay;
  listeners.forEach((listener) => listener());
}

// Also remembered in memory, for when storage is blocked.
let skippedInMemory: string | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function skippedDay(): string | null {
  return read() ?? skippedInMemory;
}

export function useDailyPlanSkipped(cardDay: string): boolean {
  return useSyncExternalStore(subscribe, skippedDay, skippedDay) === cardDay;
}
