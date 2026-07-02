"use client";

import type { Move, Phase } from "@/types/game";

type ArenaMoveControlsProps = {
  phase: Phase;
  onPick: (move: Move) => void;
};

export default function ArenaMoveControls({
  phase,
  onPick,
}: ArenaMoveControlsProps) {
  const canPick = phase === "countdown";

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-black/70 p-5 text-center shadow-[0_0_40px_rgba(0,255,255,0.12)]">
      <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200/60">
        Your move
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {(["rock", "paper", "scissors"] as Move[]).map((move) => (
          <button
            key={move}
            type="button"
            disabled={!canPick}
            onClick={() => onPick(move)}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:-translate-y-1 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:bg-white/10"
          >
            {move}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm text-white/50">
        {canPick ? "Pick before the timer hits zero." : "Waiting for the next round."}
      </div>
    </div>
  );
}
