// src/components/deadlast/RoundStatusPanel.tsx

import { Stage } from "@/types/game";

type RoundStatusPanelProps = {
  phase: string;
  stage: Stage;
  message: string;
  buyIn: number;
};

export default function RoundStatusPanel({
  phase,
  stage,
  message,
  buyIn,
}: RoundStatusPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-500/10 to-cyan-400/10 p-6">
      <div className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">Round status</div>
      <div className="mb-2 text-2xl font-black uppercase">{phase}</div>
      <div className="mb-4 text-xs uppercase tracking-[0.25em] text-cyan-200/60">
        {stage === "main" ? "Main round" : stage === "winners" ? "Winners round" : "Losers round"}
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/80">
        {message}
      </div>
      <div className="mt-4 grid gap-3 text-sm text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          1st: +${(buyIn * 0.6).toFixed(2)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          2nd: +${(buyIn * 0.3).toFixed(2)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          3rd: -${buyIn.toFixed(2)}
        </div>
      </div>
    </div>
  );
}