"use client";

/**
 * AnimatedArena — DeadLast arena scene orchestrator (PRESENTATION ONLY)
 *
 * Composes the background, central table, player stations, and center display
 * into one fixed-camera scene. It receives a fully-derived view model and never
 * touches engine, persistence, ArenaProgressContext, or match/result logic.
 *
 * Camera law (Art Bible): the camera never rotates and the local player is
 * always seated front-and-center at the bottom — enforced via seatOrderFor().
 */

import "./arena-scene.css";

import ArenaTable from "./ArenaTable";
import ArenaSeat from "./ArenaSeat";
import CenterDisplay from "./CenterDisplay";
import {
  ARENA_SEAT_LAYOUTS,
  seatOrderFor,
  type ArenaSeatMode,
} from "./SeatLayout";
import type { ArenaPlayer, ArenaBeat } from "./types";

const BG_SRC = "/arena/arena_background.png";

type AnimatedArenaProps = {
  players: ArenaPlayer[];
  /** Current phase mapped to a visual beat by the page. */
  beat: ArenaBeat;
  /** Optional center readout values. */
  round?: number;
  totalRounds?: number;
  seconds?: number;
  /** Identifies the local player when `isUser` is not set. */
  currentPlayerId?: string;
  className?: string;
};

export default function AnimatedArena({
  players,
  beat,
  round,
  totalRounds,
  seconds,
  currentPlayerId,
  className = "",
}: AnimatedArenaProps) {
  // Clamp to a supported seat count and guarantee local player at seat 0.
  const ordered = seatOrderFor(players, currentPlayerId);
  const count = Math.min(4, Math.max(2, ordered.length)) as ArenaSeatMode;
  const layout = ARENA_SEAT_LAYOUTS[count];
  const seats = ordered.slice(0, count);

  return (
    <div
      className={`dl-arena ${className}`}
      data-beat={beat}
      style={{ aspectRatio: "16 / 10", minHeight: 420 }}
    >
      <div
        className="dl-arena__bg"
        style={{ backgroundImage: `url(${BG_SRC})` }}
      />
      <div className="dl-arena__vignette" />

      <ArenaTable />

      <CenterDisplay
        round={round}
        totalRounds={totalRounds}
        seconds={seconds}
        beat={beat}
      />

      {seats.map((player, index) => (
        <ArenaSeat
          key={player.id}
          player={player}
          slot={layout[index]}
          beat={beat}
          index={index}
        />
      ))}

      <div className="dl-arena__flash" aria-hidden="true" />
    </div>
  );
}
