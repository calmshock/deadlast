"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { applyMatchToPlayers, runArenaMatch, takeNextMatch } from "@/lib/arena/matchmaking"
import { createBot } from "@/lib/arena/bots"
import {
  applyUserMatchProgress,
  awardArenaCredits,
  createEmptyArenaProgress,
  readArenaProgress,
  resetArenaAllProgress,
  resetArenaSessionProgress,
  writeArenaProgress,
} from "@/lib/arena/progress"
import {
  buildArenaUserProfileFromPlayer,
  writeArenaUserProfile,
} from "@/lib/arena/profile"
import type {
  ArenaMatchResult,
  ArenaMode,
  ArenaPick,
  ArenaPlayer,
  ArenaStats,
  ArenaUserProgress,
  ArenaViewMatch,
} from "@/types/arena"

type UseArenaOptions = {
  initialBots?: number
  maxRecentMatches?: number
  queueTopUpTarget?: number
  matchIntervalMs?: number
  playerCount?: ArenaMode
}

const DEFAULT_OPTIONS: Required<UseArenaOptions> = {
  initialBots: 8,
  maxRecentMatches: 8,
  queueTopUpTarget: 10,
  matchIntervalMs: 3500,
  playerCount: 3,
}

function createUserPlayer(): ArenaPlayer {
  const now = Date.now()

  return {
    id: "user-player",
    name: "You",
    isBot: false,
    auto: false,
    preferredPick: "rock",
    joinedAt: now,
    lastActiveAt: now,
    gamesPlayed: 0,
    wins: 0,
    seconds: 0,
    thirds: 0,
    fourths: 0,
  }
}

function resetPlayerSessionStats(player: ArenaPlayer): ArenaPlayer {
  return {
    ...player,
    gamesPlayed: 0,
    wins: 0,
    seconds: 0,
    thirds: 0,
    fourths: 0,
    lastAppliedMatchId: undefined,
    lastActiveAt: Date.now(),
  }
}

function uniqueQueue(ids: string[]): string[] {
  return [...new Set(ids)]
}

function appendUniqueQueueId(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids
  return [...ids, id]
}

function hasDuplicateIds(players: ArenaPlayer[]): boolean {
  return new Set(players.map((player) => player.id)).size !== players.length
}

export function useArena(options?: UseArenaOptions) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  const [playersById, setPlayersById] = useState<Record<string, ArenaPlayer>>({})
  const [queue, setQueue] = useState<string[]>([])
  const [currentMatch, setCurrentMatch] = useState<ArenaViewMatch | null>(null)
  const [recentMatches, setRecentMatches] = useState<ArenaMatchResult[]>([])
  const [stats, setStats] = useState<ArenaStats>({
    totalMatches: 0,
    totalPlayersSeen: 0,
    totalBotsCreated: 0,
  })
  const [userProgress, setUserProgress] = useState<ArenaUserProgress>(
    createEmptyArenaProgress(),
  )

  const runningRef = useRef(false)
  const playersByIdRef = useRef<Record<string, ArenaPlayer>>({})
  const queueRef = useRef<string[]>([])
  const processedMatchIdsRef = useRef<Set<string>>(new Set())

  function persistUserProgress(nextProgress: ArenaUserProgress) {
    setUserProgress(nextProgress)
    writeArenaProgress(nextProgress)
  }

  useEffect(() => {
    setUserProgress(readArenaProgress())
  }, [])

  useEffect(() => {
    playersByIdRef.current = playersById
  }, [playersById])

  useEffect(() => {
    queueRef.current = uniqueQueue(queue)
  }, [queue])

  useEffect(() => {
    const seededPlayers: Record<string, ArenaPlayer> = {}
    const seededQueue: string[] = []

    const user = createUserPlayer()
    seededPlayers[user.id] = user

    for (let i = 0; i < config.initialBots; i += 1) {
      const bot = createBot(i)
      seededPlayers[bot.id] = {
        ...bot,
        fourths: bot.fourths ?? 0,
      }
      seededQueue.push(bot.id)
    }

    playersByIdRef.current = seededPlayers
    queueRef.current = uniqueQueue(seededQueue)
    processedMatchIdsRef.current.clear()

    setPlayersById(seededPlayers)
    setQueue(queueRef.current)
    setCurrentMatch(null)
    setRecentMatches([])
    setStats({
      totalMatches: 0,
      totalPlayersSeen: Object.keys(seededPlayers).length,
      totalBotsCreated: config.initialBots,
    })
  }, [config.initialBots, config.playerCount])

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (runningRef.current) return

      runningRef.current = true

      const nextPlayers = { ...playersByIdRef.current }
      let nextQueue = uniqueQueue(queueRef.current)
      let botsAdded = 0

      while (nextQueue.length < config.queueTopUpTarget) {
        const bot = createBot()
        nextPlayers[bot.id] = {
          ...bot,
          fourths: bot.fourths ?? 0,
        }
        nextQueue = appendUniqueQueueId(nextQueue, bot.id)
        botsAdded += 1
      }

      const queuedPlayers = nextQueue
        .map((id) => nextPlayers[id])
        .filter((player): player is ArenaPlayer => Boolean(player))

      const matchCandidate = takeNextMatch(queuedPlayers, config.playerCount)

      if (!matchCandidate) {
        playersByIdRef.current = nextPlayers
        queueRef.current = uniqueQueue(nextQueue)

        setPlayersById(nextPlayers)
        setQueue(queueRef.current)

        if (botsAdded > 0) {
          setStats((prev) => ({
            ...prev,
            totalPlayersSeen: prev.totalPlayersSeen + botsAdded,
            totalBotsCreated: prev.totalBotsCreated + botsAdded,
          }))
        }

        runningRef.current = false
        return
      }

      const matchPlayers = matchCandidate.players

      if (hasDuplicateIds(matchPlayers)) {
        queueRef.current = uniqueQueue(nextQueue)
        setQueue(queueRef.current)
        runningRef.current = false
        return
      }

      const userBeforeMatch =
        matchPlayers.find((player) => player.id === "user-player") ?? null

      nextQueue = uniqueQueue(matchCandidate.remainingQueue.map((player) => player.id))

      setCurrentMatch({
        id: `live-${Date.now()}`,
        players: matchPlayers,
        startedAt: Date.now(),
        status: "playing",
      })

      const result = runArenaMatch(matchPlayers)
      const updatedPlayers = applyMatchToPlayers(matchPlayers, result)

      for (const updated of updatedPlayers) {
        nextPlayers[updated.id] = updated
        nextQueue = appendUniqueQueueId(nextQueue, updated.id)
      }

      const userAfterMatch =
        updatedPlayers.find((player) => player.id === "user-player") ?? null

      const userPlacement = userBeforeMatch
        ? result.placements[userBeforeMatch.id] ?? null
        : null

      const userWasLast = userPlacement === result.playerCount
      const alreadyProcessed = processedMatchIdsRef.current.has(result.id)

      if (userBeforeMatch && userAfterMatch && userWasLast && !alreadyProcessed) {
        processedMatchIdsRef.current.add(result.id)

        const currentProgress = readArenaProgress()
        const nextProgress = applyUserMatchProgress(
          currentProgress,
          userBeforeMatch,
          result,
        )

        persistUserProgress(nextProgress)
      }

      playersByIdRef.current = nextPlayers
      queueRef.current = uniqueQueue(nextQueue)

      setPlayersById(nextPlayers)
      setQueue(queueRef.current)

      if (botsAdded > 0) {
        setStats((prev) => ({
          ...prev,
          totalPlayersSeen: prev.totalPlayersSeen + botsAdded,
          totalBotsCreated: prev.totalBotsCreated + botsAdded,
        }))
      }

      setRecentMatches((prev) => [result, ...prev].slice(0, config.maxRecentMatches))

      setCurrentMatch({
        id: result.id,
        players: updatedPlayers,
        startedAt: result.startedAt,
        status: "finished",
      })

      setStats((prev) => ({
        ...prev,
        totalMatches: prev.totalMatches + 1,
      }))

      window.setTimeout(() => {
        setCurrentMatch(null)
      }, 1400)

      runningRef.current = false
    }, config.matchIntervalMs)

    return () => {
      window.clearInterval(interval)
    }
  }, [
    config.matchIntervalMs,
    config.maxRecentMatches,
    config.queueTopUpTarget,
    config.playerCount,
  ])

  const user = playersById["user-player"] ?? null
  const isUserQueued = queue.includes("user-player")

  useEffect(() => {
    writeArenaUserProfile(buildArenaUserProfileFromPlayer(user))
  }, [user])

  const queuePlayers = useMemo(() => {
    return uniqueQueue(queue)
      .map((id) => playersById[id])
      .filter((player): player is ArenaPlayer => Boolean(player))
  }, [playersById, queue])

  const leaderboard = useMemo(() => {
    return Object.values(playersById)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins
        if (b.seconds !== a.seconds) return b.seconds - a.seconds
        if (a.thirds !== b.thirds) return a.thirds - b.thirds
        if (a.fourths !== b.fourths) return a.fourths - b.fourths
        return b.gamesPlayed - a.gamesPlayed
      })
      .slice(0, 12)
  }, [playersById])

  const latestResult = recentMatches[0] ?? null
  const recentLogs = latestResult?.logs ?? []

  const totalPlacedMatches =
    (user?.wins ?? 0) +
    (user?.seconds ?? 0) +
    (user?.thirds ?? 0) +
    (user?.fourths ?? 0)

  const derivedSessionAutoLosses = userProgress.sessionIneligibleAutoLosses
  const derivedSessionEligibleLosses = userProgress.sessionEligibleLosses
  const derivedSessionLossEntries = userProgress.sessionLossEntries

  function joinArena() {
    const existing = playersByIdRef.current["user-player"] ?? createUserPlayer()

    const nextPlayers = {
      ...playersByIdRef.current,
      "user-player": {
        ...existing,
        fourths: existing.fourths ?? 0,
        auto: false,
        lastActiveAt: Date.now(),
      },
    }

    const nextQueue = appendUniqueQueueId(uniqueQueue(queueRef.current), "user-player")

    playersByIdRef.current = nextPlayers
    queueRef.current = nextQueue

    setPlayersById(nextPlayers)
    setQueue(nextQueue)
  }

  function leaveArena() {
    const nextQueue = uniqueQueue(queueRef.current).filter((id) => id !== "user-player")

    queueRef.current = nextQueue
    setQueue(nextQueue)
  }

  function setPreferredPick(pick: ArenaPick) {
    const existing = playersByIdRef.current["user-player"] ?? createUserPlayer()

    const nextPlayers = {
      ...playersByIdRef.current,
      "user-player": {
        ...existing,
        fourths: existing.fourths ?? 0,
        auto: false,
        preferredPick: pick,
        lastActiveAt: Date.now(),
      },
    }

    playersByIdRef.current = nextPlayers
    setPlayersById(nextPlayers)
  }

  function toggleAuto() {
    const existing = playersByIdRef.current["user-player"] ?? createUserPlayer()

    const nextPlayers = {
      ...playersByIdRef.current,
      "user-player": {
        ...existing,
        fourths: existing.fourths ?? 0,
        auto: !existing.auto,
        lastActiveAt: Date.now(),
      },
    }

    playersByIdRef.current = nextPlayers
    setPlayersById(nextPlayers)
  }

  function addArenaCredits(credits: number) {
    const nextProgress = awardArenaCredits(readArenaProgress(), credits)
    persistUserProgress(nextProgress)
  }

  function resetSessionProgress() {
    processedMatchIdsRef.current.clear()

    const nextProgress = resetArenaSessionProgress(readArenaProgress())
    persistUserProgress(nextProgress)

    const nextPlayers = { ...playersByIdRef.current }
    const existingUser = nextPlayers["user-player"] ?? createUserPlayer()
    nextPlayers["user-player"] = resetPlayerSessionStats(existingUser)

    playersByIdRef.current = nextPlayers
    queueRef.current = uniqueQueue(queueRef.current)

    setPlayersById(nextPlayers)
    setQueue(queueRef.current)
    setRecentMatches([])
    setCurrentMatch(null)
    setStats((prev) => ({
      ...prev,
      totalMatches: 0,
    }))
  }

  function resetAllProgress() {
    processedMatchIdsRef.current.clear()

    const nextProgress = resetArenaAllProgress()
    persistUserProgress(nextProgress)

    const nextPlayers = { ...playersByIdRef.current }
    const existingUser = nextPlayers["user-player"] ?? createUserPlayer()
    nextPlayers["user-player"] = resetPlayerSessionStats(existingUser)

    playersByIdRef.current = nextPlayers
    queueRef.current = uniqueQueue(queueRef.current)

    setPlayersById(nextPlayers)
    setQueue(queueRef.current)
    setRecentMatches([])
    setCurrentMatch(null)
    setStats((prev) => ({
      ...prev,
      totalMatches: 0,
    }))
  }

  return {
    user,
    userProgress,
    queuePlayers,
    currentMatch,
    recentMatches,
    recentLogs,
    latestResult,
    leaderboard,
    stats,
    isUserQueued,
    totalPlacedMatches,
    derivedSessionLossEntries,
    derivedSessionEligibleLosses,
    derivedSessionAutoLosses,
    joinArena,
    leaveArena,
    setPreferredPick,
    toggleAuto,
    addArenaCredits,
    resetSessionProgress,
    resetAllProgress,
  }
}