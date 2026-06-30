"use client";

import PlayerAvatar from "./PlayerAvatar";
import type { ArenaPlayer, ArenaSeatPosition } from "./types";

type ArenaSeatProps = {
  player: ArenaPlayer;
  position: ArenaSeatPosition;
  active?: boolean;
};

export default function ArenaSeat({
  player,
  position,
  active = false,
}: ArenaSeatProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <PlayerAvatar
        player={player}
        active={active}
      />
    </div>
  );
}
