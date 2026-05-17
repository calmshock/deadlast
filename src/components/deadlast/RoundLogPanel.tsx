import { MOVE_LABELS, RoundLogEntry } from "@/types/game";

type RoundLogPanelProps = {
  roundLog: RoundLogEntry[];
};

export default function RoundLogPanel({ roundLog }: RoundLogPanelProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">Round log</div>
      <h3 className="mb-4 text-2xl font-black uppercase">Live history</h3>
      {roundLog.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
          No rounds logged yet. Start a match to track every replay and tie-break.
        </div>
      ) : (
        <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          {roundLog.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/60">{entry.title}</div>
              <div className="mt-1 text-sm font-bold text-white/80">{entry.subtitle}</div>
              <div className="mt-3 space-y-1 text-sm text-white/65">
                {entry.picks.map((pick, index) => (
                  <div key={`${entry.id}-${pick.name}-${index}`} className="flex items-center justify-between">
                    <span>{pick.name}</span>
                    <span className="font-bold text-white/80">{pick.move ? MOVE_LABELS[pick.move] : "—"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-lime-200/80">{entry.outcome}</div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}