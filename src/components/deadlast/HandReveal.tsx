"use client";

import type { Move, Phase, Placement, Player } from "@/types/game";

type HandRevealProps = {
  players: Player[];
  activeIds: string[];
  placements: Partial<Record<string, Placement>>;
  phase: Phase;
};

function placementLabel(placement: Placement | undefined) {
  if (placement === 1) return "1st locked";
  if (placement === 2) return "2nd locked";
  if (placement === 3) return "3rd locked";
  if (placement === 4) return "4th locked";
  return null;
}

function HandShape({ move, showMove }: { move: Move | null; showMove: boolean }) {
  if (!showMove) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10">
        <div className="h-12 w-12 rounded-full bg-white/50" />
      </div>
    );
  }

  if (move === "paper") {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-cyan-200/60 bg-cyan-300/20">
        <div className="h-14 w-12 rounded-2xl bg-cyan-100" />
      </div>
    );
  }

  if (move === "scissors") {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-fuchsia-200/60 bg-fuchsia-300/20">
        <div className="flex gap-2">
          <div className="h-16 w-5 -rotate-12 rounded-full bg-fuchsia-100" />
          <div className="h-16 w-5 rotate-12 rounded-full bg-fuchsia-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-lime-200/60 bg-lime-300/20">
      <div className="h-14 w-14 rounded-full bg-lime-100" />
    </div>
  );
}

export default function HandReveal({
  players,
  activeIds,
  placements,
  phase,
}: HandRevealProps) {
  return (
    <section className="rounded-3xl border-4 border-fuchsia-400 bg-fuchsia-950 p-6 text-white">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
          Hand reveal
        </div>
        <h3 className="text-2xl font-black uppercase">
          Live throw animation layer
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {players.map((player) => {
          const active = activeIds.includes(player.id);
          const placement = placements[player.id];

          const winner =
            placement === 1 ||
            placement === 2;

          const loser =
            placement === 3 ||
            placement === 4;
          const lockedLabel = placementLabel(placement);

          const showMove =
            phase === "locked" || phase === "revealing" || phase === "results";

          return (
            <div
              key={player.id}
              className={`rounded-3xl border p-4 text-center ${
                active
                  ? "border-cyan-300 bg-cyan-900"
                  : "border-white/20 bg-black/40 opacity-70"
              }`}
            >
              <div className="text-sm font-black uppercase">
                {player.name}
              </div>

              <div
                className={`mt-4 flex justify-center transition-all duration-200 ${
                  phase === "countdown" && active && !player.locked
                    ? "translate-y-0 animate-pulse"
                    : ""
                } ${
                  phase === "locked" && active
                    ? "-translate-y-3 scale-110"
                    : ""
                } ${
                  phase === "revealing" && active ? "translate-y-3 scale-150 brightness-125"
                    : "scale-100"
                }`}
              >
                <HandShape move={player.move} showMove={showMove} />
              </div>

              <div className="mt-4 text-xs uppercase tracking-[0.2em] text-white/70">
                {lockedLabel
                  ? lockedLabel
                  : player.locked
                  ? "Move locked"
                  : active
                  ? "Choosing"
                  : "Waiting"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}



