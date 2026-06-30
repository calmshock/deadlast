"use client";
/**
 * ArenaScenePreview — PRESENTATION ONLY / ISOLATED DEMO
 *
 * A self-contained preview of the new DeadLast arena scene (Sprint 001).
 * It feeds AnimatedArena STATIC sample data so the scene can be reviewed
 * visually WITHOUT touching the game engine, useDeadlastGame, ArenaProgressContext,
 * persistence, or match/result logic.
 *
 * This component intentionally holds only local UI state (selected seat count
 * and a demo beat). It is NOT the gameplay UI and is not wired to any hook.
 * The real gameplay path on /arena remains ArenaStage.
 */
import { useState } from "react";
import AnimatedArena from "./AnimatedArena";
import type { ArenaPlayer, ArenaBeat } from "./types";
import type { ArenaSeatMode } from "./SeatLayout";

const SAMPLE_NAMES = ["You", "Vex", "Riot", "Nova"];

/** Build static demo seats; "You" is always the local player at index 0. */
function demoPlayers(count: number, beat: ArenaBeat): ArenaPlayer[] {
  const revealed = beat === "revealing" || beat === "results";
  const demoMoves = ["rock", "scissors", "rock", "paper"] as const;
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${i}`,
    name: SAMPLE_NAMES[i] ?? `P${i + 1}`,
    move: revealed ? demoMoves[i % demoMoves.length] : null,
    locked: beat === "locked" || revealed,
    active: true,
    placement: beat === "results" ? (((i % 4) + 1) as 1 | 2 | 3 | 4) : undefined,
    isUser: i === 0,
  }));
}

const SEAT_OPTIONS: ArenaSeatMode[] = [2, 3, 4];
const BEAT_OPTIONS: ArenaBeat[] = [
  "waiting",
  "countdown",
  "locked",
  "revealing",
  "results",
];

export default function ArenaScenePreview() {
  const [count, setCount] = useState<ArenaSeatMode>(4);
  const [beat, setBeat] = useState<ArenaBeat>("countdown");

  return (
    <section className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
          Sprint 001 Preview — not gameplay
        </span>
        <div className="flex items-center gap-1 text-xs text-white/70">
          <span className="mr-1">Seats:</span>
          {SEAT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`rounded-md px-2 py-1 ${
                count === n
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs text-white/70">
          <span className="mr-1">Beat:</span>
          {BEAT_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBeat(b)}
              className={`rounded-md px-2 py-1 capitalize ${
                beat === b
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(255,0,0,0.12)]">
        <AnimatedArena
          players={demoPlayers(count, beat)}
          beat={beat}
          round={3}
          totalRounds={5}
          seconds={beat === "countdown" ? 15 : 0}
          currentPlayerId="demo-0"
        />
      </div>
    </section>
  );
}
