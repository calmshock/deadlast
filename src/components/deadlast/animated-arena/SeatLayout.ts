/**
 * DeadLast Arena — Seat Layout (PRESENTATION ONLY)
 *
 * Art Bible camera law:
 *   - The camera never rotates.
 *   - The local player ("you") is ALWAYS front-and-center at the bottom.
 *
 * These layouts describe SEAT positions only. They contain no gameplay logic.
 * Positions are percentages of the scene box so the arena scales responsively.
 * `depth` (0 = far/back, 1 = near/front) drives perspective scaling and
 * z-index in the scene; it is purely visual.
 *
 * Seat ordering convention: index 0 is ALWAYS the local player (bottom-front).
 */

export type ArenaSeatSlot = {
  /** Horizontal center of the seat, % of scene width. */
  x: number;
  /** Vertical center of the seat, % of scene height. */
  y: number;
  /** 0 = farthest from camera, 1 = closest. Drives scale + stacking. */
  depth: number;
  /** Human-readable role for clarity/debugging. */
  role: "you" | "opponent";
};

export type ArenaSeatMode = 2 | 3 | 4;

/**
 * Seat 0 is the local player at bottom-center in every mode. Opponents are
 * arranged around the far arc so all hands face inward toward the table center.
 */
export const ARENA_SEAT_LAYOUTS: Record<ArenaSeatMode, ArenaSeatSlot[]> = {
  // 2 players: You bottom, opponent directly across (far center).
  2: [
    { x: 50, y: 82, depth: 1, role: "you" },
    { x: 50, y: 30, depth: 0, role: "opponent" },
  ],

  // 3 players: You bottom-center, two opponents on the far-left/right arc.
  3: [
    { x: 50, y: 84, depth: 1, role: "you" },
    { x: 24, y: 40, depth: 0.35, role: "opponent" },
    { x: 76, y: 40, depth: 0.35, role: "opponent" },
  ],

  // 4 players: You bottom-center; opponents on left, far/top, and right.
  4: [
    { x: 50, y: 85, depth: 1, role: "you" },
    { x: 20, y: 52, depth: 0.55, role: "opponent" },
    { x: 50, y: 27, depth: 0, role: "opponent" },
    { x: 80, y: 52, depth: 0.55, role: "opponent" },
  ],
};

/**
 * Returns a seat-index order that guarantees the local player occupies seat 0
 * (bottom-front), with opponents following in their original order. This keeps
 * the camera law intact regardless of how the engine orders `players`.
 */
export function seatOrderFor<T extends { isUser?: boolean; id?: string }>(
  players: T[],
  currentPlayerId?: string,
): T[] {
  const isLocal = (p: T) =>
    p.isUser === true || (currentPlayerId != null && p.id === currentPlayerId);

  const local = players.find(isLocal);
  if (!local) return players;

  const opponents = players.filter((p) => p !== local);
  return [local, ...opponents];
}

// Backwards-compatible alias for the previous scaffold export name.
export const seatLayouts = ARENA_SEAT_LAYOUTS;
