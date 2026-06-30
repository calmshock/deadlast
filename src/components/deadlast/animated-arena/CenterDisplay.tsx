"use client";

/**
 * CenterDisplay — round / timer / prompt readout (PRESENTATION ONLY)
 *
 * Mirrors the live engine values (round number, countdown seconds, phase) into
 * the center of the table. It computes nothing about the game; it only formats
 * the values it is given.
 */

import type { ArenaBeat } from "./types";

type CenterDisplayProps = {
  round?: number;
  totalRounds?: number;
  /** Remaining seconds in the current countdown. */
  seconds?: number;
  beat: ArenaBeat;
};

function promptForBeat(beat: ArenaBeat): string {
  switch (beat) {
    case "countdown":
      return "Make Your Move";
    case "locked":
      return "Locked In";
    case "revealing":
      return "Reveal";
    case "results":
      return "Results";
    case "waiting":
    default:
      return "Get Ready";
  }
}

export default function CenterDisplay({
  round,
  totalRounds,
  seconds,
  beat,
}: CenterDisplayProps) {
  const showTimer = beat === "countdown" && typeof seconds === "number";
  const low = showTimer && (seconds as number) <= 1;

  return (
    <div className="dl-center">
      {typeof round === "number" && (
        <div className="dl-center__round">
          Round {round}
          {typeof totalRounds === "number" ? ` / ${totalRounds}` : ""}
        </div>
      )}
      {showTimer && (
        <div className="dl-center__timer" data-low={low ? "true" : "false"}>
          0:{String(Math.max(0, seconds as number)).padStart(2, "0")}
        </div>
      )}
      <div className="dl-center__prompt">{promptForBeat(beat)}</div>
    </div>
  );
}
