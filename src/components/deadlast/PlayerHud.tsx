type PlayerHudProps = {
  balance: number;
  entries: number;
  lifetimeEntries: number;
  odds: string;
  countdown: string;
};

export default function PlayerHud({
  balance,
  entries,
  lifetimeEntries,
  odds,
  countdown,
}: PlayerHudProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <HudCard
          label="Balance"
          value={`$${balance.toFixed(2)}`}
          tone="text-lime-300"
        />

        <HudCard
          label="Cycle Entries"
          value={String(entries)}
          tone="text-amber-200"
        />

        <HudCard
          label="Lifetime Entries"
          value={String(lifetimeEntries)}
          tone="text-cyan-200"
        />

        <HudCard
          label="Daily Odds"
          value={odds}
          tone="text-white"
        />

        <HudCard
          label="Next Draw"
          value={countdown}
          tone="text-fuchsia-200"
        />
      </div>
    </section>
  );
}

function HudCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>

      <div className={`mt-2 text-2xl font-black ${tone}`}>
        {value}
      </div>
    </div>
  );
}
