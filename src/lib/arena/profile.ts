import type { ArenaPlayer } from "@/types/arena"

export const ARENA_PROFILE_STORAGE_KEY = "deadlast:arena:user-profile"

export type ArenaUserProfileSnapshot = {
  auto: boolean
  preferredPick: ArenaPlayer["preferredPick"]
  gamesPlayed: number
  wins: number
  seconds: number
  thirds: number
  lastSyncedAt: number
}

export function createEmptyArenaUserProfile(): ArenaUserProfileSnapshot {
  return {
    auto: false,
    preferredPick: "rock",
    gamesPlayed: 0,
    wins: 0,
    seconds: 0,
    thirds: 0,
    lastSyncedAt: Date.now(),
  }
}

export function readArenaUserProfile(): ArenaUserProfileSnapshot {
  if (typeof window === "undefined") {
    return createEmptyArenaUserProfile()
  }

  try {
    const raw = window.localStorage.getItem(ARENA_PROFILE_STORAGE_KEY)
    if (!raw) return createEmptyArenaUserProfile()

    const parsed = JSON.parse(raw) as Partial<ArenaUserProfileSnapshot>

    return {
      auto: Boolean(parsed.auto),
      preferredPick:
        parsed.preferredPick === "rock" ||
        parsed.preferredPick === "paper" ||
        parsed.preferredPick === "scissors" ||
        parsed.preferredPick === null
          ? parsed.preferredPick
          : "rock",
      gamesPlayed: Number(parsed.gamesPlayed ?? 0),
      wins: Number(parsed.wins ?? 0),
      seconds: Number(parsed.seconds ?? 0),
      thirds: Number(parsed.thirds ?? 0),
      lastSyncedAt: Number(parsed.lastSyncedAt ?? Date.now()),
    }
  } catch {
    return createEmptyArenaUserProfile()
  }
}

export function writeArenaUserProfile(profile: ArenaUserProfileSnapshot) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(ARENA_PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // ignore storage failures
  }
}

export function buildArenaUserProfileFromPlayer(
  player: ArenaPlayer | null,
): ArenaUserProfileSnapshot {
  if (!player) {
    return createEmptyArenaUserProfile()
  }

  return {
    auto: player.auto,
    preferredPick: player.preferredPick,
    gamesPlayed: player.gamesPlayed,
    wins: player.wins,
    seconds: player.seconds,
    thirds: player.thirds,
    lastSyncedAt: Date.now(),
  }
}