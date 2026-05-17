"use client"

import type { Move, MoveStats, Phase, Placement, Player, Stage } from "@/types/game"

type Props = {
  players: Player[]
  activePlayers: Player[]
  placements: Partial<Record<string, Placement>>
  phase: Phase
  stage: Stage
  message: string
  timer: number
  moveStats: Record<string, MoveStats>
  onPick: (pick: Move) => void
}

function topMoveLabel(stats: MoveStats | undefined) {
  if (!stats) return "No data yet"

  const entries = Object.entries(stats).sort((a, b) => Number(b[1]) - Number(a[1]))
  const top = entries[0]?.[0]

  if (top === "rock") return "Mostly Rock"
  if (top === "paper") return "Mostly Paper"
  if (top === "scissors") return "Mostly Scissors"

  return "No data yet"
}

function placementLabel(placement: Placement | undefined) {
  if (placement === 1) return "1st place locked"
  if (placement === 2) return "2nd place locked"
  if (placement === 3) return "3rd place locked"
  return "Placement locked"
}

function stageLabel(stage: Stage) {
  if (stage === "main") return "Main round"
  if (stage === "winners") return "Playing for 1st / 2nd"
  return "Playing for 2nd / 3rd"
}

export default function PickModal({
  players = [],
  activePlayers = [],
  placements,
  phase,
  stage,
  message,
  timer,
  moveStats,
  onPick,
}: Props) {
  const userPlayer =
    activePlayers.find((player) => player.isUser) ??
    players.find((player) => player.isUser) ??
    null

  const userIsActive = Boolean(activePlayers.find((player) => player.isUser))
  const userLocked = Boolean(userPlayer?.locked)
  const userMove = userPlayer?.move ?? null
  const userPlacement = userPlayer ? placements[userPlayer.id] : undefined

  const waitingAfterPlacement = !userIsActive && Boolean(userPlacement)
  const revealing = phase === "locked" || phase === "revealing"

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/75 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-900 p-6 text-white shadow-[0_0_60px_rgba(0,0,0,0.6)]">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-white/45">
            {stageLabel(stage)}
          </div>

          <div className="mt-2 text-4xl font-black text-red-300">{timer}</div>

          {waitingAfterPlacement ? (
            <div className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">
                {placementLabel(userPlacement)}
              </div>
              <div className="mt-1 text-2xl font-black uppercase text-cyan-200">
                Waiting for remaining places
              </div>
              <div className="mt-2 text-sm text-white/60">
                {message}
              </div>
            </div>
          ) : revealing ? (
            <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                Revealing
              </div>
              <div className="mt-1 text-2xl font-black uppercase text-amber-200">
                Resolving round
              </div>
              <div className="mt-2 text-sm text-white/60">
                {message}
              </div>
            </div>
          ) : userLocked ? (
            <div className="mt-5 rounded-2xl border border-lime-300/30 bg-lime-400/10 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-lime-200/70">
                Move locked
              </div>
              <div className="mt-1 text-2xl font-black uppercase text-lime-200">
                {userMove}
              </div>
              <div className="mt-2 text-sm text-white/60">
                Waiting for the timer to finish...
              </div>
            </div>
          ) : userIsActive ? (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onPick("rock")}
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-lg font-black transition hover:bg-white/20"
              >
                Rock
              </button>

              <button
                onClick={() => onPick("paper")}
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-lg font-black transition hover:bg-white/20"
              >
                Paper
              </button>

              <button
                onClick={() => onPick("scissors")}
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-lg font-black transition hover:bg-white/20"
              >
                Scissors
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                Spectating tie-break
              </div>
              <div className="mt-1 text-2xl font-black uppercase text-white/80">
                Waiting
              </div>
              <div className="mt-2 text-sm text-white/60">
                The remaining players are finishing the round.
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 text-center text-xs uppercase tracking-[0.25em] text-white/45">
          Active players this round
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {activePlayers.map((player) => (
            <div
              key={player.id}
              className={`rounded-2xl border px-4 py-4 text-center ${
                player.locked
                  ? "border-lime-300/25 bg-lime-400/10"
                  : "border-cyan-300/20 bg-cyan-400/10"
              }`}
            >
              <div className="text-sm font-black uppercase">{player.name}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.15em] text-cyan-100/70">
                {player.locked ? "Locked" : topMoveLabel(moveStats[player.name])}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-white/35">
          Round committed — no cancel after match start
        </div>
      </div>
    </div>
  )
}