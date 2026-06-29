"use client";

import type { Move, Phase, Placement, Player } from "@/types/game";
import PaperHand from "./hands/PaperHand";
import RockHand from "./hands/RockHand";
import ScissorsHand from "./hands/ScissorsHand";

type ArenaStageProps = {
  players: Player[];
  activeIds: string[];
  placements: Partial<Record<string, Placement>>;
  phase: Phase;
  timer: number;
  onPick: (move: Move) => void;
};

function placementLabel(placement: Placement) {
  if (placement === 1) return "1st";
  if (placement === 2) return "2nd";
  if (placement === 3) return "3rd";
  return `${placement}th`;
}

function handLabel(move: Move | null) {
  if (move === "rock") return "ROCK";
  if (move === "paper") return "PAPER";
  if (move === "scissors") return "SCISSORS";
  return "READY";
}

function statusLabel(
  player: Player,
  active: boolean,
  placement: Placement | undefined,
  phase: Phase,
) {
  if (placement) return placementLabel(placement);
  if (!active) return "Waiting";
  if (phase === "countdown") return player.locked ? "Locked" : "Choosing";
  if (phase === "locked") return "Locked";
  if (phase === "revealing") return "Reveal";
  return "Ready";
}

function HandGraphic({
  move,
  showMove,
  active,
}: {
  move: Move | null;
  showMove: boolean;
  active: boolean;
}) {
  const handClass = `h-24 w-24 drop-shadow-[0_14px_22px_rgba(0,0,0,0.45)] ${
    active ? "text-white" : "text-white/25"
  }`;

  if (!showMove || !move) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
        Ready
      </div>
    );
  }

  if (move === "rock") return <RockHand className={handClass} />;
  if (move === "paper") return <PaperHand className={handClass} />;
  return <ScissorsHand className={handClass} />;
}

export default function ArenaStage({
  players,
  activeIds,
  placements,
  phase,
  timer,
  onPick,
}: ArenaStageProps) {
  const showMove = phase === "locked" || phase === "revealing" || phase === "results";
  const canPick = phase === "countdown";
  const isReveal = phase === "revealing";
  const isResults = phase === "results";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black p-4 shadow-[0_0_80px_rgba(255,0,0,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-8 bottom-16 h-56 rounded-[50%] border border-white/10 bg-[radial-gradient(circle,rgba(80,80,80,0.45),rgba(0,0,0,0.9)_65%)] shadow-[inset_0_0_80px_rgba(255,255,255,0.08)]" />

      {isReveal ? (
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_52%)]" />
      ) : null}

      <div className="relative text-center">
        <div className="text-xs uppercase tracking-[0.45em] text-red-200/50">
          Deadlast battle zone
        </div>

        <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
          Arena Clash
        </h2>

        <div
          className={`mt-4 text-4xl font-black transition-all duration-300 ${
            isReveal ? "scale-125 text-white" : "text-red-300"
          }`}
        >
          {phase === "countdown" ? timer : phase === "lobby" ? "READY" : "REVEAL"}
        </div>
      </div>

      <div className="relative mx-auto mt-4 flex max-w-5xl flex-wrap items-center justify-center gap-6">
        {players.map((player, index) => {
          const active = activeIds.includes(player.id);
          const placement = placements[player.id];

          const neutralTone = active
            ? "border-white/20 bg-white/5 text-white shadow-[0_0_30px_rgba(255,255,255,0.08)]"
            : "border-white/10 bg-white/5 text-white/40";

          const cardTone =
            (isReveal || isResults) && placement === 1
              ? "border-lime-300/50 bg-lime-500/10 text-lime-100 ring-2 ring-lime-300/60 shadow-[0_0_45px_rgba(132,255,120,0.25)]"
              : (isReveal || isResults) && placement === 3
              ? "border-red-300/50 bg-red-500/10 text-red-100 ring-2 ring-red-400/50 shadow-[0_0_45px_rgba(255,80,80,0.25)]"
              : (isReveal || isResults) && placement === 2
              ? "border-yellow-300/50 bg-yellow-500/10 text-yellow-100 ring-2 ring-yellow-300/50 shadow-[0_0_45px_rgba(255,220,80,0.22)]"
              : neutralTone;

          return (
            <div
              key={player.id}
              className={`w-[180px] rounded-3xl border p-4 text-center transition-all duration-500 ${cardTone} ${isReveal && active ? "scale-105" : "scale-100"}`}
              style={{
                transitionDelay: isReveal ? `${index * 90}ms` : "0ms",
              }}
            >
              <div className="text-sm font-black uppercase tracking-[0.18em] text-white">
                {player.name}
              </div>

              <div className="mt-4 flex justify-center">
                <div
                  className={`flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-black/40 transition-all duration-500 ${
                    phase === "countdown" && active && !player.locked ? "animate-bounce" : ""
                  } ${
                    phase === "locked" && active ? "-translate-y-2 scale-105 shadow-[0_0_35px_rgba(255,255,255,0.15)]" : ""
                  } ${
                    isReveal && active ? "translate-y-3 scale-125 rotate-[-8deg] brightness-125" : ""
                  } ${
                    isResults && placement === 1 ? "-translate-y-2 scale-110" : ""
                  }`}
                >
                  <HandGraphic move={player.move} showMove={showMove} active={active} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/75">
                {statusLabel(player, active, placement, phase)}
              </div>

              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                {showMove ? handLabel(player.move) : "Pick hidden"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto mt-4 max-w-2xl rounded-3xl border border-white/10 bg-black/50 p-5 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-white/45">
          Your move
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {(["rock", "paper", "scissors"] as Move[]).map((move) => (
            <button
              key={move}
              type="button"
              disabled={!canPick}
              onClick={() => onPick(move)}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:-translate-y-1 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:bg-white/10"
            >
              {move}
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-white/50">
          {phase === "lobby"
            ? "Start a match to enter the arena."
            : canPick
            ? "Pick before the timer hits zero."
            : "Round committed."}
        </div>
      </div>
    </section>
  );
}




