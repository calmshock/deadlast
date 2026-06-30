"use client";

import ArenaTable from "./ArenaTable";
import ArenaSeat from "./ArenaSeat";
import { seatLayouts } from "./SeatLayout";
import type { ArenaPlayer } from "./types";

type AnimatedArenaProps = {
  players: ArenaPlayer[];
  currentPlayerId?: string;
};

export default function AnimatedArena({
  players,
  currentPlayerId,
}: AnimatedArenaProps) {
  const layout =
    seatLayouts[players.length as keyof typeof seatLayouts];

  return (
    <div className="relative h-[700px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950">

      <ArenaTable />

      {players.map((player, index) => (
        <ArenaSeat
          key={player.id}
          player={player}
          position={layout[index]}
          active={player.id === currentPlayerId}
        />
      ))}
    </div>
  );
}
