/**
 * DeadLast Arena — presentation types (PRESENTATION ONLY)
 *
 * These types describe ONLY what the scene needs to render. They are a view
 * model derived from engine state by the consuming page; the scene never reads
 * or mutates engine/game state directly.
 */

import type { Move, Phase, Placement } from "@/types/game";

/** A seat's view model — purely what the arena needs to draw one station. */
export type ArenaPlayer = {
  id: string;
  name: string;
  /** Selected move; null until chosen. */
  move: Move | null;
  /** Whether this seat has committed its move this round. */
  locked: boolean;
  /** Whether this seat is still active in the match. */
  active: boolean;
  /** This seat's placement once decided (1..4). */
  placement?: Placement;
  /** Optional display balance. */
  balance?: number;
  /** True for the local human player. */
  isUser?: boolean;
};

export type ArenaChoice = Move;

export type ArenaSeatPosition = {
  x: string;
  y: string;
};

/**
 * The scene maps the engine `Phase` onto these visual beats. This is a 1:1
 * presentational mapping, not new game logic.
 */
export type ArenaBeat =
  | "waiting"
  | "countdown"
  | "locked"
  | "revealing"
  | "results";

export function beatFromPhase(phase: Phase): ArenaBeat {
  switch (phase) {
    case "countdown":
      return "countdown";
    case "locked":
      return "locked";
    case "revealing":
      return "revealing";
    case "results":
      return "results";
    case "lobby":
    default:
      return "waiting";
  }
}
