export type ArenaPick = "rock" | "paper" | "scissors"

export type ArenaMode = 2 | 3 | 4

export type ArenaPlayer = {
  id: string
  name: string
  isBot: boolean
  auto: boolean
  preferredPick: ArenaPick | null
  joinedAt: number
  lastActiveAt: number
  gamesPlayed: number
  wins: number
  seconds: number
  thirds: number
  fourths: number
  lastAppliedMatchId?: string
}

export type ArenaPlacement = 1 | 2 | 3 | 4

export type ArenaMatchPlayer = ArenaPlayer & {
  pick: ArenaPick
}

export type ArenaRoundLog = {
  id: string
  title: string
  detail: string
}

export type ArenaMatchResult = {
  id: string
  startedAt: number
  finishedAt: number
  playerCount: ArenaMode
  players: ArenaMatchPlayer[]
  placements: Record<string, ArenaPlacement>
  logs: ArenaRoundLog[]
  subtitle: string
}

export type ArenaViewMatch = {
  id: string
  players: ArenaPlayer[]
  startedAt: number
  status: "waiting" | "playing" | "finished"
}

export type ArenaStats = {
  totalMatches: number
  totalPlayersSeen: number
  totalBotsCreated: number
}

export type ArenaUserProgress = {
  sessionLossEntries: number
  lifetimeLossEntries: number

  sessionEligibleLosses: number
  lifetimeEligibleLosses: number

  sessionIneligibleAutoLosses: number
  lifetimeIneligibleAutoLosses: number

  arenaCredits: number
  lastUpdatedAt: number
}