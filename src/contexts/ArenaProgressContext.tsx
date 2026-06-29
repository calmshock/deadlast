"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ArenaUserProgress } from "@/types/arena";
import {
  createEmptyArenaProgress,
  readArenaProgress,
  writeArenaProgress,
  ARENA_PROGRESS_UPDATED_EVENT,
} from "@/lib/arena/progress";

type ArenaProgressContextType = {
  progress: ArenaUserProgress;
  updateProgress: (updates: Partial<ArenaUserProgress>) => void;
  addSessionLossEntry: () => void;
  addLifetimeLossEntry: () => void;
  addSessionEligibleLoss: () => void;
  addLifetimeEligibleLoss: () => void;
  addSessionIneligibleAutoLoss: () => void;
  addLifetimeIneligibleAutoLoss: () => void;
  resetSessionProgress: () => void;
  resetAllProgress: () => void;
};

const ArenaProgressContext = createContext<ArenaProgressContextType | null>(null);

export function ArenaProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState<ArenaUserProgress>(() =>
    readArenaProgress()
  );

  // Listen for external storage updates (from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "deadlast:arena:user-progress" && event.newValue) {
        try {
          const updated = JSON.parse(event.newValue) as ArenaUserProgress;
          setProgress(updated);
        } catch {
          // ignore parse errors
        }
      }
    };

    // Listen for custom event from same tab
    const handleProgressUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        setProgress(event.detail as ArenaUserProgress);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(ARENA_PROGRESS_UPDATED_EVENT, handleProgressUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        ARENA_PROGRESS_UPDATED_EVENT,
        handleProgressUpdate
      );
    };
  }, []);

  const updateProgress = (updates: Partial<ArenaUserProgress>) => {
    const newProgress: ArenaUserProgress = {
      ...progress,
      ...updates,
      lastUpdatedAt: Date.now(),
    };
    setProgress(newProgress);
    writeArenaProgress(newProgress);
  };

  const addSessionLossEntry = () => {
    updateProgress({
      sessionLossEntries: progress.sessionLossEntries + 1,
    });
  };

  const addLifetimeLossEntry = () => {
    updateProgress({
      lifetimeLossEntries: progress.lifetimeLossEntries + 1,
    });
  };

  const addSessionEligibleLoss = () => {
    updateProgress({
      sessionEligibleLosses: progress.sessionEligibleLosses + 1,
    });
  };

  const addLifetimeEligibleLoss = () => {
    updateProgress({
      lifetimeEligibleLosses: progress.lifetimeEligibleLosses + 1,
    });
  };

  const addSessionIneligibleAutoLoss = () => {
    updateProgress({
      sessionIneligibleAutoLosses: progress.sessionIneligibleAutoLosses + 1,
    });
  };

  const addLifetimeIneligibleAutoLoss = () => {
    updateProgress({
      lifetimeIneligibleAutoLosses: progress.lifetimeIneligibleAutoLosses + 1,
    });
  };

  const resetSessionProgress = () => {
    updateProgress({
      sessionLossEntries: 0,
      sessionEligibleLosses: 0,
      sessionIneligibleAutoLosses: 0,
    });
  };

  const resetAllProgress = () => {
    setProgress(createEmptyArenaProgress());
    writeArenaProgress(createEmptyArenaProgress());
  };

  const value: ArenaProgressContextType = {
    progress,
    updateProgress,
    addSessionLossEntry,
    addLifetimeLossEntry,
    addSessionEligibleLoss,
    addLifetimeEligibleLoss,
    addSessionIneligibleAutoLoss,
    addLifetimeIneligibleAutoLoss,
    resetSessionProgress,
    resetAllProgress,
  };

  return (
    <ArenaProgressContext.Provider value={value}>
      {children}
    </ArenaProgressContext.Provider>
  );
}

export function useArenaProgress() {
  const context = useContext(ArenaProgressContext);
  if (!context) {
    throw new Error(
      "useArenaProgress must be used within ArenaProgressProvider"
    );
  }
  return context;
}
