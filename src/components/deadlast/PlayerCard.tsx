import { MOVE_LABELS, Phase, Placement, Player, ResultRow } from "@/types/game";
import { fmt } from "@/lib/payouts";
import type { ArenaPick } from "@/types/arena";

type PlayerCardProps = {
  player: Player;
  phase: Phase;
  placement?: Placement;
  result?: ResultRow;
  isActiveInCurrentRound: boolean;
  cycleEntries?: number;
  lifetimeEntries?: number;
  entriesAwardEligible?: boolean;
  entriesEarnedThisMatch?: number;
  arenaAutoEnabled?: boolean;
  arenaGamesPlayed?: number;
  arenaWins?: number;
  arenaSeconds?: number;
  arenaThirds?: number;
  arenaPreferredPick?: ArenaPick | null;
};

function getEntryOutcomeText(
  entriesAwardEligible: boolean | undefined,
  entriesEarnedThisMatch: number | undefined,
  phase: Phase,
  result?: ResultRow
) {
  if (phase !== "results" || !result) {
    return "Waiting for result";
  }

  if (!entriesAwardEligible) {
    return "No entry (manual-only)";
  }

  if ((entriesEarnedThisMatch ?? 0) > 0) {
    return `+${entriesEarnedThisMatch} this match`;
  }

  return "No entry earned";
}

function formatArenaPickLabel(pick: ArenaPick | null | undefined) {
  if (pick === "rock") return "Rock";
  if (pick === "paper") return "Paper";
  if (pick === "scissors") return "Scissors";
  return "None";
}

export default function PlayerCard({
  player,
  phase,
  placement,
  result,
  isActiveInCurrentRound,
  cycleEntries,
  lifetimeEntries,
  entriesAwardEligible,
  entriesEarnedThisMatch,
  arenaAutoEnabled,
  arenaGamesPlayed,
  arenaWins,
  arenaSeconds,
  arenaThirds,
  arenaPreferredPick,
}: PlayerCardProps) {
  const revealed = phase === "revealing" || phase === "results";
  const showUserEntryPanel = player.isUser;
  const entryOutcomeText = getEntryOutcomeText(
    entriesAwardEligible,
    entriesEarnedThisMatch,
    phase,
    result
  );

  return (
    <div
      className={`rounded-3xl border p-5 transition ${
        placement === 1
          ? "border-lime-300/30 bg-lime-400/10"
          : placement === 2
          ? "border-cyan-300/30 bg-cyan-400/10"
          : placement === 3
          ? "border-red-300/30 bg-red-500/10"
          : "border-white/10 bg-white/5"
      } ${!isActiveInCurrentRound && phase !== "results" ? "opacity-65" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-lg font-black uppercase">{player.name}</div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/45">
            {player.isUser ? "You" : "Bot"}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-white/45">
            {placement ? "Place" : isActiveInCurrentRound ? "Live" : "Waiting"}
          </div>
          <div className="text-xl font-black">
            {placement ? placement : isActiveInCurrentRound ? "•" : "—"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
        <div className="mb-2 text-xs uppercase tracking-[0.3em] text-white/45">
          Move
        </div>
        <div className="text-3xl font-black uppercase">
          {revealed && player.move
            ? MOVE_LABELS[player.move]
            : player.locked
            ? "Locked"
            : isActiveInCurrentRound
            ? "Waiting"
            : "Standing by"}
        </div>
      </div>

      {result && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-white/45">
            Result
          </div>
          <div
            className={`mt-1 text-2xl font-black ${
              result.delta > 0 ? "text-lime-300" : "text-red-300"
            }`}
          >
            {fmt(result.delta)}
          </div>
        </div>
      )}

      {showUserEntryPanel && (
        <>
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-amber-200/60">
                  Prize cycle
                </div>
                <div className="mt-1 text-2xl font-black text-amber-200">
                  {cycleEntries ?? 0}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                  Lifetime
                </div>
                <div className="mt-1 text-lg font-bold text-white/85">
                  {lifetimeEntries ?? 0}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Arena-fed entry status
              </div>
              <div className="mt-1 text-sm font-semibold text-white/85">
                {entryOutcomeText}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/60">
                  Arena mode
                </div>
                <div className="mt-1 text-lg font-black text-cyan-100">
                  {arenaAutoEnabled ? "Auto On" : "Manual"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                  Preferred
                </div>
                <div className="mt-1 text-sm font-semibold text-white/85">
                  {formatArenaPickLabel(arenaPreferredPick)}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                  Games
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {arenaGamesPlayed ?? 0}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                  1st
                </div>
                <div className="mt-1 text-lg font-black text-lime-300">
                  {arenaWins ?? 0}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                  2nd
                </div>
                <div className="mt-1 text-lg font-black text-cyan-200">
                  {arenaSeconds ?? 0}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                  3rd
                </div>
                <div className="mt-1 text-lg font-black text-red-300">
                  {arenaThirds ?? 0}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}