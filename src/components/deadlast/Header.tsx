"use client";

import { useEffect, useState } from "react";

type HeaderProps = {
  balance: number;
  entries: number;
  entriesDelta?: number;
};

export default function Header({ balance, entries, entriesDelta = 0 }: HeaderProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (entriesDelta > 0) {
      setPulse(true);
      const id = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(id);
    }
  }, [entriesDelta]);

  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-white/50">
          AvoidLast MVP
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          DeadLast
        </h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-right shadow-[0_0_24px_rgba(251,191,36,0.12)]">
          <div className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
            Entries This Cycle
          </div>

          <div className="relative text-2xl font-bold">
            <span className={pulse ? "animate-pulse text-amber-200" : ""}>
              {entries}
            </span>

            {pulse && (
              <span className="absolute -top-3 right-0 text-xs font-bold text-amber-300 animate-bounce">
                +{entriesDelta}
              </span>
            )}
          </div>

          <div className="text-[11px] uppercase tracking-[0.18em] text-amber-100/45">
            Daily Prize Weight
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-right shadow-[0_0_24px_rgba(34,211,238,0.15)]">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">
            Balance
          </div>
          <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
        </div>
      </div>
    </header>
  );
}