"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ArenaUserProgress } from "@/types/arena";
import {
  ARENA_PROGRESS_STORAGE_KEY,
  ARENA_PROGRESS_UPDATED_EVENT,
  createEmptyArenaProgress,
  readArenaProgress,
  writeArenaProgress,
} from "@/lib/arena/progress";

/**
 * ArenaProgressContext is the single source of truth for arena entry/progress
 * state (session + lifetime loss entries, eligible losses, ineligible auto
 * losses, arena credits).
 *
 * It owns the React state and persists every change to localStorage via the
 * existing `writeArenaProgress` helper, so reads and writes stay consistent
 * across `/` and `/arena` without manual sync calls.
 */
interface ArenaProgressContextType {
  progress: ArenaUserProgress;
  /** Replace the whole progress object (used by reset/admin flows). */
  setProgress: (next: ArenaUserProgress) => void;
  /**
   * Record a manual, eligible last-place finish. Increments session + lifetime
   * loss entries AND eligible losses in a single atomic update. This is the
   * ONLY path that adds a prize entry.
   */
  recordEligibleManualLoss: () => void;
  /**
   * Record an auto-picked last-place finish. Increments only the ineligible
   * auto-loss counters; never adds a prize entry.
   */
  recordIneligibleAutoLoss: () => void;
  /** Reset session counters only (lifetime totals preserved). */
  resetSessionProgress: () => void;
  /** Reset everything (session + lifetime). */
  resetAllProgress: () => void;
}

const ArenaProgressContext = createContext<ArenaProgressContextType | null>(
  null,
);

export function ArenaProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize from localStorage on the client; fall back to empty on server.
  const [progress, setProgressState] = useState<ArenaUserProgress>(() =>
    readArenaProgress(),
  );

  // Persist every change to localStorage (writeArenaProgress also dispatches
  // the ARENA_PROGRESS_UPDATED_EVENT for any non-context listeners).
  useEffect(() => {
    writeArenaProgress(progress);
  }, [progress]);

  // Keep in sync if another tab/window updates the same storage key.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ARENA_PROGRESS_STORAGE_KEY) {
        setProgressState(readArenaProgress());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setProgress = useCallback((next: ArenaUserProgress) => {
    setProgressState(next);
  }, []);

  const recordEligibleManualLoss = useCallback(() => {
    setProgressState((prev) => ({
      ...prev,
      sessionLossEntries: prev.sessionLossEntries + 1,
      lifetimeLossEntries: prev.lifetimeLossEntries + 1,
      sessionEligibleLosses: prev.sessionEligibleLosses + 1,
      lifetimeEligibleLosses: prev.lifetimeEligibleLosses + 1,
      lastUpdatedAt: Date.now(),
    }));
  }, []);

  const recordIneligibleAutoLoss = useCallback(() => {
    setProgressState((prev) => ({
      ...prev,
      sessionIneligibleAutoLosses: prev.sessionIneligibleAutoLosses + 1,
      lifetimeIneligibleAutoLosses: prev.lifetimeIneligibleAutoLosses + 1,
      lastUpdatedAt: Date.now(),
    }));
  }, []);

  const resetSessionProgress = useCallback(() => {
    setProgressState((prev) => ({
      ...prev,
      sessionLossEntries: 0,
      sessionEligibleLosses: 0,
      sessionIneligibleAutoLosses: 0,
      lastUpdatedAt: Date.now(),
    }));
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgressState(createEmptyArenaProgress());
  }, []);

  const value: ArenaProgressContextType = {
    progress,
    setProgress,
    recordEligibleManualLoss,
    recordIneligibleAutoLoss,
    resetSessionProgress,
    resetAllProgress,
  };

  return (
    <ArenaProgressContext.Provider value={value}>
      {children}
    </ArenaProgressContext.Provider>
  );
}

export function useArenaProgress(): ArenaProgressContextType {
  const context = useContext(ArenaProgressContext);

  // During SSR/prerender (or if used outside the provider) the context is
  // null. Return a no-op shape so static prerendering of the not-found and
  // error pages does not crash. On the client inside the provider, the real
  // value is always returned.
  if (!context) {
    return {
      progress: createEmptyArenaProgress(),
      setProgress: () => {},
      recordEligibleManualLoss: () => {},
      recordIneligibleAutoLoss: () => {},
      resetSessionProgress: () => {},
      resetAllProgress: () => {},
    };
  }

  return context;
}

export { ARENA_PROGRESS_UPDATED_EVENT };
