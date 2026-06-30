"use client";

/**
 * ArenaSeat — a single player station (PRESENTATION ONLY)
 *
 * Renders the pedestal image, the player's hand resting on it, a glow ring,
 * and a nameplate. All visual state (locked lift, win/dead tones, idle float)
 * is driven by props derived from engine state upstream. No gameplay logic.
 */

import type { ArenaSeatSlot } from "./SeatLayout";
import type { ArenaPlayer, ArenaBeat } from "./types";
import ArenaHand from "./ArenaHand";

const PEDESTAL_SRC = "/arena/arena_pedestal.png";

type ArenaSeatProps = {
  player: ArenaPlayer;
  slot: ArenaSeatSlot;
  beat: ArenaBeat;
  /** Stagger index for idle-float offset. */
  index: number;
};

function statusLabel(player: ArenaPlayer, beat: ArenaBeat): string {
  if (player.placement) {
    const p = player.placement;
    return p === 1 ? "1ST" : p === 2 ? "2ND" : p === 3 ? "3RD" : "4TH";
  }
  if (!player.active) return "OUT";
  if (beat === "countdown") return player.locked ? "LOCKED" : "CHOOSING";
  if (beat === "locked") return "LOCKED";
  if (beat === "revealing") return "REVEAL";
  return "READY";
}

export default function ArenaSeat({ player, slot, beat, index }: ArenaSeatProps) {
  const revealed = beat === "revealing" || beat === "results";

  // Perspective scaling: nearer seats (depth→1) render larger.
  const scale = 0.72 + slot.depth * 0.42;

  const outcome =
    player.placement === 1
      ? "win"
      : player.placement && player.placement >= 3
        ? "dead"
        : "none";

  return (
    <div
      className="dl-seat"
      data-role={slot.role}
      data-locked={player.locked ? "true" : "false"}
      data-outcome={outcome}
      style={{
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        zIndex: 10 + Math.round(slot.depth * 10),
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: player.active ? 1 : 0.55,
      }}
    >
      <div
        className="dl-seat__float"
        style={{ animationDelay: `${index * 0.35}s` }}
      >
        <div className="dl-seat__pedestal">
          <div className="dl-seat__ring" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="dl-seat__pedestal-img"
            src={PEDESTAL_SRC}
            alt=""
            aria-hidden="true"
          />
          <div className="dl-seat__hand">
            <ArenaHand move={player.move} revealed={revealed} />
          </div>
        </div>
      </div>

      <div className="dl-seat__plate">
        <span className="dl-seat__name">{player.name}</span>
        {typeof player.balance === "number" && (
          <span className="dl-seat__balance">${player.balance.toFixed(2)}</span>
        )}
        <span className="dl-seat__status">{statusLabel(player, beat)}</span>
      </div>
    </div>
  );
}
