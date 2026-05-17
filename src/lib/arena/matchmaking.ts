import type {
  ArenaMatchPlayer,
  ArenaMatchResult,
  ArenaMode,
  ArenaPick,
  ArenaPlayer,
  ArenaPlacement,
  ArenaRoundLog,
} from "@/types/arena"
import { getPlayerPick } from "@/lib/arena/bots"

function beats(a: ArenaPick, b: ArenaPick): boolean {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
}

function makeLogId(matchId: string, index: number, label: string) {
  return `${matchId}-${label}-${index}`
}

function pushLog(
  logs: ArenaRoundLog[],
  matchId: string,
  label: string,
  title: string,
  detail: string,
) {
  logs.push({
    id: makeLogId(matchId, logs.length + 1, label),
    title,
    detail,
  })
}

function cloneWithPicks(players: ArenaPlayer[]): ArenaMatchPlayer[] {
  return players.map((player) => ({
    ...player,
    pick: getPlayerPick(player),
  }))
}

function placementLabel(placement: ArenaPlacement) {
  if (placement === 1) return "1st"
  if (placement === 2) return "2nd"
  if (placement === 3) return "3rd"
  return "4th"
}

export function takeNextMatch(
  queue: ArenaPlayer[],
  playerCount: ArenaMode = 3,
): {
  players: ArenaPlayer[]
  remainingQueue: ArenaPlayer[]
} | null {
  if (queue.length < playerCount) return null

  const players = queue.slice(0, playerCount)
  const remainingQueue = queue.slice(playerCount)

  return { players, remainingQueue }
}

function rankPlayers(
  players: ArenaPlayer[],
  startingPlacement: ArenaPlacement,
  matchId: string,
  placements: Record<string, ArenaPlacement>,
  logs: ArenaRoundLog[],
) {
  if (players.length === 1) {
    placements[players[0].id] = startingPlacement

    pushLog(
      logs,
      matchId,
      "single-placement",
      `${placementLabel(startingPlacement)} place assigned`,
      `${players[0].name} takes ${placementLabel(startingPlacement)} place.`,
    )

    return
  }

  let roundPlayers = cloneWithPicks(players)
  let uniquePicks = new Set(roundPlayers.map((player) => player.pick))

  while (uniquePicks.size !== 2) {
    pushLog(
      logs,
      matchId,
      "replay",
      "Round replay",
      `${roundPlayers.map((p) => `${p.name} chose ${p.pick}`).join(" • ")} — replaying.`,
    )

    roundPlayers = cloneWithPicks(players)
    uniquePicks = new Set(roundPlayers.map((player) => player.pick))
  }

  const picks = [...uniquePicks]
  const firstPick = picks[0]
  const secondPick = picks[1]

  const winningPick = beats(firstPick, secondPick) ? firstPick : secondPick
  const losingPick = winningPick === firstPick ? secondPick : firstPick

  const winners = roundPlayers.filter((player) => player.pick === winningPick)
  const losers = roundPlayers.filter((player) => player.pick === losingPick)

  const winnerNames = winners.map((player) => player.name).join(", ")
  const loserNames = losers.map((player) => player.name).join(", ")

  pushLog(
    logs,
    matchId,
    "split",
    "Round split",
    `${winnerNames} beat ${loserNames}.`,
  )

  rankPlayers(winners, startingPlacement, matchId, placements, logs)

  const loserStartingPlacement = (startingPlacement + winners.length) as ArenaPlacement
  rankPlayers(losers, loserStartingPlacement, matchId, placements, logs)
}

export function runArenaMatch(players: ArenaPlayer[]): ArenaMatchResult {
  if (players.length < 2 || players.length > 4) {
    throw new Error("Arena match requires 2, 3, or 4 players.")
  }

  const startedAt = Date.now()
  const matchId = `match-${startedAt}-${Math.random().toString(36).slice(2, 8)}`
  const logs: ArenaRoundLog[] = []
  const placements: Record<string, ArenaPlacement> = {}

  pushLog(
    logs,
    matchId,
    "start",
    "Match started",
    `${players.map((player) => player.name).join(" • ")}`,
  )

  rankPlayers(players, 1, matchId, placements, logs)

  const sortedPlacements = Object.entries(placements).sort((a, b) => a[1] - b[1])
  const winnerId = sortedPlacements[0]?.[0]
  const lastId = sortedPlacements[sortedPlacements.length - 1]?.[0]

  const winner = players.find((player) => player.id === winnerId)
  const last = players.find((player) => player.id === lastId)

  const finalPlayers = cloneWithPicks(players)

  return {
    id: matchId,
    startedAt,
    finishedAt: Date.now(),
    playerCount: players.length as ArenaMode,
    players: finalPlayers,
    placements,
    logs,
    subtitle:
      winner && last
        ? `${winner.name} takes 1st — ${last.name} finishes last`
        : "Match resolved",
  }
}

export function applyMatchToPlayers(
  sourcePlayers: ArenaPlayer[],
  result: ArenaMatchResult,
): ArenaPlayer[] {
  return sourcePlayers.map((player) => {
    const placement = result.placements[player.id]

    if (!placement) return player

    if (player.lastAppliedMatchId === result.id) {
      return player
    }

    return {
      ...player,
      gamesPlayed: player.gamesPlayed + 1,
      wins: player.wins + (placement === 1 ? 1 : 0),
      seconds: player.seconds + (placement === 2 ? 1 : 0),
      thirds: player.thirds + (placement === 3 ? 1 : 0),
      fourths: player.fourths + (placement === 4 ? 1 : 0),
      lastActiveAt: Date.now(),
      lastAppliedMatchId: result.id,
    }
  })
}