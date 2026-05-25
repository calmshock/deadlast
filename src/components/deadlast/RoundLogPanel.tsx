import { MOVE_LABELS, RoundLogEntry } from "@/types/game";

type RoundLogPanelProps = {
  roundLog: RoundLogEntry[];
};

function toneForEntry(entry: RoundLogEntry) {
  const text = `${entry.title} ${entry.subtitle} ${entry.outcome}`.toLowerCase();

  if (text.includes("replay") || text.includes("tie") || text.includes("no clean")) {
    return "border-yellow-300/20 bg-yellow-500/10 text-yellow-200";
  }

  if (text.includes("danger") || text.includes("4th") || text.includes("dropped")) {
    return "border-red-300/20 bg-red-500/10 text-red-200";
  }

  if (text.includes("top") || text.includes("secured") || text.includes("defeated")) {
    return "border-lime-300/20 bg-lime-500/10 text-lime-200";
  }

  return "border-cyan-300/20 bg-cyan-500/10 text-cyan-200";
}

export default function RoundLogPanel({ roundLog }: RoundLogPanelProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">
        Round log
      </div>

      <h3 className="mb-4 text-2xl font-black uppercase">Live history</h3>

      {roundLog.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
          No rounds logged yet. Brackets, ties, and placement locks will appear here.
        </div>
      ) : (
        <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          {roundLog.map((entry, index) => {
            const tone = toneForEntry(entry);

            return (
              <div
                key={entry.id}
                className={`rounded-2xl border p-4 ${tone}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] opacity-75">
                      Round {roundLog.length - index}
                    </div>
                    <div className="mt-1 text-lg font-black uppercase text-white">
                      {entry.title}
                    </div>
                  </div>

                  <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold uppercase text-white/70">
                    {entry.subtitle}
                  </div>
                </div>

                {entry.picks.length > 0 ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {entry.picks.map((pick, pickIndex) => (
                      <div
                        key={`${entry.id}-${pick.name}-${pickIndex}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm"
                      >
                        <span className="font-bold text-white/85">{pick.name}</span>
                        <span className="font-black text-white">
                          {pick.move ? MOVE_LABELS[pick.move] : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-sm leading-relaxed text-white/80">
                  {entry.outcome}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}