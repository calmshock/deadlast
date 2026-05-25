"use client";

import type { Move, Phase, Placement, Player } from "@/types/game";

type HandRevealProps = {
  players: Player[];
  activeIds: string[];
  placements: Partial<Record<string, Placement>>;
  phase: Phase;
};

function beats(a: Move, b: Move) {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}

function placementLabel(placement: Placement | undefined) {
  if (placement === 1) return "1st locked";
  if (placement === 2) return "2nd locked";
  if (placement === 3) return "3rd locked";
  if (placement === 4) return "4th locked";
  return null;
}

function HandShape({ move, showMove }: { move: Move | null; showMove: boolean }) {
  const visibleMove = showMove ? move : null;

  if (visibleMove === "paper") {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12">
        <rect x="26" y="18" width="13" height="60" rx="7" className="fill-cyan-100" />
        <rect x="42" y="10" width="13" height="68" rx="7" className="fill-cyan-100" />
        <rect x="58" y="14" width="13" height="64" rx="7" className="fill-cyan-100" />
        <rect x="74" y="24" width="13" height="54" rx="7" className="fill-cyan-100" />
        <rect x="32" y="62" width="58" height="38" rx="18" className="fill-cyan-200" />
        <rect x="45" y="98" width="34" height="14" rx="7" className="fill-cyan-300" />
      </svg>
    );
  }

  if (visibleMove === "scissors") {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12">
        <rect x="43" y="10" width="16" height="70" rx="8" className="origin-bottom -rotate-12 fill-fuchsia-100" />
        <rect x="62" y="10" width="16" height="70" rx="8" className="origin-bottom rotate-12 fill-fuchsia-100" />
        <rect x="35" y="62" width="50" height="38" rx="18" className="fill-fuchsia-200" />
        <rect x="45" y="98" width="34" height="14" rx="7" className="fill-fuchsia-300" />
      </svg>
    );
  }

  if (visibleMove === "rock") {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12">
        <rect x="24" y="34" width="18" height="34" rx="8" className="fill-lime-100" />
        <rect x="43" y="28" width="18" height="40" rx="8" className="fill-lime-100" />
        <rect x="62" y="30" width="18" height="38" rx="8" className="fill-lime-100" />
        <rect x="81" y="38" width="16" height="30" rx="8" className="fill-lime-100" />
        <rect x="28" y="58" width="68" height="44" rx="20" className="fill-lime-200" />
        <rect x="46" y="98" width="34" height="14" rx="7" className="fill-lime-300" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="h-12 w-12">
      <rect x="24" y="34" width="18" height="34" rx="8" className="fill-white/50" />
      <rect x="43" y="28" width="18" height="40" rx="8" className="fill-white/50" />
      <rect x="62" y="30" width="18" height="38" rx="8" className="fill-white/50" />
      <rect x="81" y="38" width="16" height="30" rx="8" className="fill-white/50" />
      <rect x="28" y="58" width="68" height="44" rx="20" className="fill-white/30" />
      <rect x="46" y="98" width="34" height="14" rx="7" className="fill-white/20" />
    </svg>
  );
}

export default function HandReveal({
  players,
  activeIds,
  placements,
  phase,
}: HandRevealProps) {
  const showMove =
    phase === "locked" || phase === "revealing" || phase === "results";

  const activePlayers = players.filter((player) => activeIds.includes(player.id));
  const activeMoves = activePlayers
    .map((player) => player.move)
    .filter(Boolean) as Move[];

  const uniqueMoves = [...new Set(activeMoves)];

  let roundWinnerMove: Move | null = null;
  let roundLoserMove: Move | null = null;

  if (showMove && uniqueMoves.length === 2) {
    const first = uniqueMoves[0];
    const second = uniqueMoves[1];

    roundWinnerMove = beats(first, second) ? first : second;
    roundLoserMove = roundWinnerMove === first ? second : first;
  }

  const roundIsTie =
    showMove &&
    activeMoves.length === activePlayers.length &&
    uniqueMoves.length !== 2;

  const totalPlayers = Math.max(players.length, activePlayers.length);

  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-5 text-white text-center">
      <div className="mb-2">
        <div className="text-xs uppercase tracking-[0.3em] text-white/45">
          Hand reveal
        </div>
        <h3 className="text-xl font-black uppercase">Live throw</h3>
      </div>

      <div className="mx-auto flex w-full flex-wrap items-center justify-center gap-4">{players.map((player) => {
          const active = activeIds.includes(player.id);
          const placement = placements[player.id];
          const lockedLabel = placementLabel(placement);

          const roundWon =
            active &&
            showMove &&
            Boolean(roundWinnerMove) &&
            player.move === roundWinnerMove;

          const roundLost =
            active &&
            showMove &&
            Boolean(roundLoserMove) &&
            player.move === roundLoserMove;

          const tied = active && roundIsTie;

          const finalWon = Boolean(placement && placement < totalPlayers);
          const finalLost = Boolean(placement && placement === totalPlayers);

          return (
            <div
              key={player.id}
              className={`rounded-3xl border p-4 text-center transition-all duration-300 ${
                roundWon || finalWon
                  ? "border-lime-300 bg-lime-900/40 shadow-[0_0_40px_rgba(132,255,120,0.45)]"
                  : roundLost || finalLost
                  ? "border-red-300 bg-red-900/50 shadow-[0_0_45px_rgba(255,40,40,0.55)]"
                  : tied
                  ? "border-yellow-300 bg-yellow-900/40 shadow-[0_0_35px_rgba(255,220,80,0.45)]"
                  : active
                  ? "border-cyan-300 bg-cyan-900/40"
                  : "border-white/20 bg-black/40 opacity-70"
              }`}
            >
              <div className="text-sm font-black uppercase">{player.name}</div>

              <div
                className={`mt-2 flex justify-center transition-all duration-200 ${
                  phase === "countdown" && active && !player.locked
                    ? "translate-y-0 animate-bounce"
                    : ""
                } ${
                  phase === "locked" && active
                    ? "-translate-y-3 scale-110"
                    : ""
                } ${
                  phase === "revealing" && active
                    ? "translate-y-3 scale-150 brightness-125"
                    : "scale-100"
                }`}
              >
                <HandShape move={player.move} showMove={showMove} />
              </div>

              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
                {lockedLabel
                  ? lockedLabel
                  : tied
                  ? "Tie / replay"
                  : roundWon
                  ? "Round won"
                  : roundLost
                  ? "Round lost"
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




