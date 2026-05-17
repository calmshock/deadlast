import type { ArenaMatchResult, ArenaPlayer, ArenaUserProgress } from "@/types/arena"

export const ARENA_PROGRESS_STORAGE_KEY = "deadlast:arena:user-progress"
export const ARENA_PROGRESS_UPDATED_EVENT = "deadlast:arena-progress-updated"

export function createEmptyArenaProgress(): ArenaUserProgress {
  return {
    sessionLossEntries: 0,
    lifetimeLossEntries: 0,
    sessionEligibleLosses: 0,
    lifetimeEligibleLosses: 0,
    sessionIneligibleAutoLosses: 0,
    lifetimeIneligibleAutoLosses: 0,
    arenaCredits: 0,
    lastUpdatedAt: Date.now(),
  }
}

export function readArenaProgress(): ArenaUserProgress {
  if (typeof window === "undefined") {
    return createEmptyArenaProgress()
  }

  try {
    const raw = window.localStorage.getItem(ARENA_PROGRESS_STORAGE_KEY)
    if (!raw) return createEmptyArenaProgress()

    const parsed = JSON.parse(raw) as Partial<ArenaUserProgress> & {
      lossEntries?: number
      eligibleLosses?: number
      ineligibleAutoLosses?: number
    }

    const migratedLifetimeLossEntries = Number(
      parsed.lifetimeLossEntries ?? parsed.lossEntries ?? 0,
    )
    const migratedLifetimeEligibleLosses = Number(
      parsed.lifetimeEligibleLosses ?? parsed.eligibleLosses ?? 0,
    )
    const migratedLifetimeAutoLosses = Number(
      parsed.lifetimeIneligibleAutoLosses ?? parsed.ineligibleAutoLosses ?? 0,
    )

    return {
      sessionLossEntries: Number(parsed.sessionLossEntries ?? 0),
      lifetimeLossEntries: migratedLifetimeLossEntries,

      sessionEligibleLosses: Number(parsed.sessionEligibleLosses ?? 0),
      lifetimeEligibleLosses: migratedLifetimeEligibleLosses,

      sessionIneligibleAutoLosses: Number(parsed.sessionIneligibleAutoLosses ?? 0),
      lifetimeIneligibleAutoLosses: migratedLifetimeAutoLosses,

      arenaCredits: Number(parsed.arenaCredits ?? 0),
      lastUpdatedAt: Number(parsed.lastUpdatedAt ?? Date.now()),
    }
  } catch {
    return createEmptyArenaProgress()
  }
}

export function writeArenaProgress(progress: ArenaUserProgress) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(ARENA_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    window.dispatchEvent(
      new CustomEvent(ARENA_PROGRESS_UPDATED_EVENT, {
        detail: progress,
      }),
    )
  } catch {
    // ignore storage failures
  }
}

export function applyUserMatchProgress(
  progress: ArenaUserProgress,
  userBeforeMatch: ArenaPlayer | null,
  result: ArenaMatchResult,
): ArenaUserProgress {
  if (!userBeforeMatch) {
    return progress
  }

  const placement = result.placements[userBeforeMatch.id]
  const lastPlace = result.playerCount

  if (placement !== lastPlace) {
    return {
      ...progress,
      lastUpdatedAt: Date.now(),
    }
  }

  if (userBeforeMatch.auto) {
    return {
      ...progress,
      sessionIneligibleAutoLosses: progress.sessionIneligibleAutoLosses + 1,
      lifetimeIneligibleAutoLosses: progress.lifetimeIneligibleAutoLosses + 1,
      lastUpdatedAt: Date.now(),
    }
  }

  return {
    ...progress,
    sessionLossEntries: progress.sessionLossEntries + 1,
    lifetimeLossEntries: progress.lifetimeLossEntries + 1,

    sessionEligibleLosses: progress.sessionEligibleLosses + 1,
    lifetimeEligibleLosses: progress.lifetimeEligibleLosses + 1,

    lastUpdatedAt: Date.now(),
  }
}

export function awardArenaCredits(
  progress: ArenaUserProgress,
  credits: number,
): ArenaUserProgress {
  return {
    ...progress,
    arenaCredits: progress.arenaCredits + Math.max(0, credits),
    lastUpdatedAt: Date.now(),
  }
}

export function resetArenaSessionProgress(
  progress: ArenaUserProgress,
): ArenaUserProgress {
  return {
    ...progress,
    sessionLossEntries: 0,
    sessionEligibleLosses: 0,
    sessionIneligibleAutoLosses: 0,
    lastUpdatedAt: Date.now(),
  }
}

export function resetArenaAllProgress(): ArenaUserProgress {
  return createEmptyArenaProgress()
}