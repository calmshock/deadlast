import { ResultRow } from "@/types/game";
import { fmt } from "@/lib/payouts";

type ResultsPanelProps = {
  results: ResultRow[];
  entriesAwardEligible: boolean;
  entriesEarnedThisMatch: number;
};

export default function ResultsPanel({
  results,
  entriesAwardEligible,
  entriesEarnedThisMatch,
}: ResultsPanelProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-white/50">Results</div>
        <h3 className="text-2xl font-black uppercase">Placings and payouts</h3>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-white/50">
          No final results yet. Tie-break rounds are tracked live in the round log.
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-amber-200/60">
                  Entry summary
                </div>
                <div className="mt-1 text-sm text-white/75">
                  {entriesAwardEligible
                    ? "You manually picked your move, so if you finished last the entry counted."
                    : "Your move was auto-picked by the timer, so no entry counted this match."}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-amber-200/60">
                  You earned
                </div>
                <div className="text-2xl font-black text-amber-200">
                  +{entriesEarnedThisMatch}
                </div>
              </div>
            </div>
          </div>

          {results.map((row) => {
            const isUser = row.name === "You";

            return (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Place {row.placement}
                  </div>
                  <div className="text-xl font-black uppercase">{row.name}</div>
                  {isUser && (
                    <div className="mt-1 text-sm text-amber-200/80">
                      Entries: +{entriesEarnedThisMatch}
                    </div>
                  )}
                </div>

                <div
                  className={`text-2xl font-black ${
                    row.delta > 0 ? "text-lime-300" : "text-red-300"
                  }`}
                >
                  {fmt(row.delta)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}