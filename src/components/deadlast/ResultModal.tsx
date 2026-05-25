import { ResultRow } from "@/types/game";
import { fmt } from "@/lib/payouts";

type ResultModalProps = {
  show: boolean;
  finishContext: string;
  modalSummary: ResultRow[];
  autoPlayEnabled: boolean;
  autoPlayDelay: number;
  entriesAwardEligible: boolean;
  entriesEarnedThisMatch: number;
  setShowResultModal: (value: boolean) => void;
  setAutoPlayEnabled: (value: boolean) => void;
  setAutoPlayDelay: (value: number) => void;
  playAgain: () => void;
};

function ordinal(place: number) {
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return "4th";
}

export default function ResultModal({
  show,
  modalSummary,
  autoPlayEnabled,
  autoPlayDelay,
  entriesAwardEligible,
  entriesEarnedThisMatch,
  setShowResultModal,
  setAutoPlayEnabled,
  setAutoPlayDelay,
  playAgain,
}: ResultModalProps) {
  if (!show) return null;

  const standings = [...modalSummary].sort((a, b) => a.placement - b.placement);
  const playerCount = standings.length;
  const yourResult = standings.find((row) => row.name === "You");
  const lastPlace = playerCount;

  const youWon = yourResult?.placement === 1;
  const youLost = yourResult?.placement === lastPlace;

  const badge = youWon ? "Winner" : youLost ? "Deadlast" : "Survived";
  const title = youWon ? "You won" : youLost ? "You finished last" : `${ordinal(yourResult?.placement ?? 2)} place`;

  const body = youWon
    ? "You avoided last and took the top payout."
    : youLost
    ? "You finished last. Manual last-place finishes earn prize entries."
    : "You avoided last and earned a placement payout.";

  const panelClass = youWon
  ? "border-lime-300/30 bg-neutral-950"
  : youLost
  ? "border-red-300/30 bg-neutral-950"
  : "border-cyan-300/30 bg-neutral-950";

  const titleClass = youWon
    ? "text-lime-200"
    : youLost
    ? "text-red-200"
    : "text-cyan-200";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 bg-black/70 px-4 py-4">
      <div className={`max-h-[unset] w-full max-w-sm  rounded-3xl border p-3 text-center ${panelClass}`}>
        <div className="text-xs uppercase tracking-[0.35em] text-white/55">
          {badge}
        </div>

        <h3 className={`mt-1 text-xs font-black uppercase ${titleClass}`}>
          {title}
        </h3>

        <p className="mt-1 text-white/70">{body}</p>

        <div className="mt-2 rounded-xl border border-amber-300/20 bg-amber-500/10 p-3 text-left">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-200/60">
            Prize entry result
          </div>

          <div className="mt-2 text-xs text-white/75">
            {entriesEarnedThisMatch > 0
              ? "You earned +1 prize entry for a manual last-place finish."
              : entriesAwardEligible
              ? "You manually picked, but only last place earns a prize entry."
              : "Auto-picked moves do not qualify for prize entries."}
          </div>

          <div className="mt-2 text-xs font-black text-amber-200">
            +{entriesEarnedThisMatch}
          </div>
        </div>

        <div className="mt-1 space-y-3 text-left">
          {standings.map((row) => {
            const isLast = row.placement === lastPlace;

            return (
              <div
                key={row.name}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  isLast
                    ? "border-red-300/20 bg-red-500/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                    {ordinal(row.placement)} place
                  </div>

                  <div className="text-xs font-black uppercase">{row.name}</div>

                  {row.name === "You" ? (
                    <div className="mt-1 text-xs text-amber-200/80">
                      Entries: +{entriesEarnedThisMatch}
                    </div>
                  ) : null}
                </div>

                <div className={`text-xs font-black ${row.delta > 0 ? "text-lime-300" : "text-red-300"}`}>
                  {fmt(row.delta)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-1 rounded-xl border border-white/10 bg-black/20 p-3 text-left">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-center gap-2 text-xs text-white/80">
              <input
                type="checkbox"
                checked={autoPlayEnabled}
                onChange={(e) => setAutoPlayEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <span>Autoplay following matches until turned off</span>
            </label>

            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>Delay</span>
              <select
                value={String(autoPlayDelay)}
                onChange={(e) => setAutoPlayDelay(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="1500">1.5s</option>
                <option value="3000">3s</option>
                <option value="5000">5s</option>
                <option value="8000">8s</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-1 flex justify-center gap-2">
          <button
            onClick={() => setShowResultModal(false)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white/80 transition hover:bg-white/10"
          >
            Close
          </button>

          <button
            onClick={playAgain}
            className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(239,68,68,0.35)] transition hover:scale-[1.02] hover:bg-red-400"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}








