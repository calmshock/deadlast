import { ResultRow } from "@/types/game";
import { fmt } from "@/lib/payouts";

type ResultsPanelProps = {
  results: ResultRow[];
  entriesAwardEligible: boolean;
  entriesEarnedThisMatch: number;
};

function ordinal(place: number) {
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return "4th";
}

export default function ResultsPanel({
  results,
  entriesAwardEligible,
  entriesEarnedThisMatch,
}: ResultsPanelProps) {
  const standings = [...results].sort((a, b) => a.placement - b.placement);
  const lastPlace = standings.length;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.3em] text-white/50">
          Results
        </div>
        <h3 className="text-2xl font-black uppercase">Placings and payouts</h3>
      </div>

      {standings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-white/50">
          No final results yet. Brackets and tie-break rounds are tracked live in the round log.
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
                  {entriesEarnedThisMatch > 0
                    ? "Manual last-place finish counted for +1 prize entry."
                    : entriesAwardEligible
                    ? "You manually picked, but only last place earns an entry."
                    : "Your move was auto-picked, so no entry counted this match."}
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

          {standings.map((row) => {
            const isUser = row.name === "You";
            const isLast = row.placement === lastPlace;

            return (
              <div
                key={row.name}
                className={`flex items-center justify-between rounded-2xl border p-4 ${
                  isLast
                    ? "border-red-300/20 bg-red-500/10"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                    {ordinal(row.placement)} place
                  </div>

                  <div className="text-xl font-black uppercase">{row.name}</div>

                  {isUser ? (
                    <div className="mt-1 text-sm text-amber-200/80">
                      Entries: +{entriesEarnedThisMatch}
                    </div>
                  ) : null}
                </div>

                <div className={`text-2xl font-black ${row.delta > 0 ? "text-lime-300" : "text-red-300"}`}>
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