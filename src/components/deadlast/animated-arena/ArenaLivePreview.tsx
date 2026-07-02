"use client";

import { useEffect, useState } from "react";
import AnimatedArena from "./AnimatedArena";
import { buildArenaPlayers } from "./arenaViewModel";
import { beatFromPhase } from "./types";
import { useDeadlastGame } from "@/hooks/useDeadlastGame";

export default function ArenaLivePreview() {
  const game = useDeadlastGame();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4 text-cyan-200">
        Loading live arena preview...
      </section>
    );
  }

  const userPlayer = game.players.find((player) => player.isUser);

  return (
    <section className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
          Sprint 002 Live Preview - mirrors real game state
        </span>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,255,255,0.12)]">
        <AnimatedArena
          players={buildArenaPlayers({
            players: game.players,
            activeIds: game.activeIds,
            placements: game.placements,
            balance: game.balance,
          })}
          beat={beatFromPhase(game.phase)}
          seconds={game.timer}
          currentPlayerId={userPlayer?.id}
        />
      </div>
    </section>
  );
}
