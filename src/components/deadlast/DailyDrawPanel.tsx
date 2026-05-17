"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DailyDrawPanelProps = {
  entries: number;
  lifetimeEntries?: number;
  drawPoolEntries: number;
  nextDrawAt: number;
  dailyDrawPrize: string;
  sponsorSlot: {
    name: string;
    tagline: string;
    cta: string;
    href: string;
    logo?: string;
    imageUrl?: string;
  };
  sponsorClickStats?: {
    totalClicks: number;
    sessionClicks: number;
    dailyClicks: number;
    lastClickAt: number | null;
  };
  handleSponsorClick?: () => void;
  recordImpression?: () => void;
  exportSponsorReport?: () => void;
  onSponsorClick?: () => void;
  onImpression?: () => void;
  onExportReport?: () => void;
  ctr?: number;
  lastDrawWinner: string | null;
  lastDrawAt: number | null;
};

function formatCountdown(msRemaining: number) {
  if (msRemaining <= 0) return "Drawing...";

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

function formatLastDrawTime(timestamp: number | null) {
  if (!timestamp) return "No draw completed yet";
  return new Date(timestamp).toLocaleString();
}

function formatLastClickTime(timestamp: number | null) {
  if (!timestamp) return "No clicks yet";
  return new Date(timestamp).toLocaleString();
}

export default function DailyDrawPanel({
  entries,
  lifetimeEntries,
  drawPoolEntries,
  nextDrawAt,
  dailyDrawPrize,
  sponsorSlot,
  sponsorClickStats,
  handleSponsorClick,
  recordImpression,
  exportSponsorReport,
  onSponsorClick,
  onImpression,
  onExportReport,
  ctr,
  lastDrawWinner,
  lastDrawAt,
}: DailyDrawPanelProps) {
  const [now, setNow] = useState(Date.now());
  const [collapsed, setCollapsed] = useState(false);
  const hasTrackedImpression = useRef(false);

  const safeStats = sponsorClickStats ?? {
    totalClicks: 0,
    sessionClicks: 0,
    dailyClicks: 0,
    lastClickAt: null,
  };

  const safeCtr = typeof ctr === "number" ? ctr : 0;
  const sponsorLogo = sponsorSlot.logo ?? sponsorSlot.imageUrl ?? "";
  const sponsorHref = sponsorSlot.href || "#";

  const sponsorClickHandler = handleSponsorClick ?? onSponsorClick;
  const impressionHandler = recordImpression ?? onImpression;
  const exportHandler = exportSponsorReport ?? onExportReport;

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (hasTrackedImpression.current) return;
    hasTrackedImpression.current = true;
    impressionHandler?.();
  }, [impressionHandler]);

  const countdown = useMemo(() => {
    return formatCountdown(nextDrawAt - now);
  }, [nextDrawAt, now]);

  const yourOdds = useMemo(() => {
    if (drawPoolEntries <= 0 || entries <= 0) return "0.00%";
    return `${((entries / drawPoolEntries) * 100).toFixed(2)}%`;
  }, [entries, drawPoolEntries]);

  return (
    <section className="w-full min-w-0 rounded-3xl border border-white/10 bg-white/5 p-4">
      <a
        href={sponsorHref}
        target="_blank"
        rel="noreferrer"
        onClick={sponsorClickHandler}
        className="block rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4 transition hover:bg-fuchsia-500/15"
      >
        <div className="flex flex-col gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {sponsorLogo ? (
              <img
                src={sponsorLogo}
                alt={sponsorSlot.name}
                className="h-14 w-14 shrink-0 rounded-lg border border-white/10 object-cover"
              />
            ) : null}

            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/60">
                Sponsor spotlight
              </div>
              <div className="mt-1 break-words text-2xl font-black uppercase leading-tight text-fuchsia-100">
                {sponsorSlot.name}
              </div>
              <div className="mt-1 text-sm leading-snug text-white/70">
                {sponsorSlot.tagline}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-fuchsia-300/20 bg-black/20 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-fuchsia-200/60">
                Featured prize
              </div>
              <div className="mt-1 break-words text-2xl font-black leading-tight text-lime-300">
                {dailyDrawPrize}
              </div>
            </div>

            <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white/90">
              {sponsorSlot.cta}
            </div>
          </div>
        </div>
      </a>

      <div className="mt-5 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/60">
            Daily draw
          </div>
          <h3 className="mt-1 text-3xl font-black uppercase leading-tight">
            Play for the prize
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            Entries reset each prize cycle. Only manual 3rd-place finishes add
            weight to the current daily draw.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={exportHandler}
            className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/15"
          >
            Export Report
          </button>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-amber-200/60">
              Next draw
            </div>
            <div className="mt-1 text-3xl font-black leading-tight text-amber-200">
              {countdown}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/10 sm:col-span-2 xl:col-span-1"
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Prize" value={dailyDrawPrize} valueClass="text-lime-300" />

            <InfoCard
              label="Entries this cycle"
              value={String(entries)}
              valueClass="text-amber-200"
              highlight
              note="Manual 3rd = 1 entry"
            />

            <InfoCard
              label="Pool entries"
              value={String(drawPoolEntries)}
              valueClass="text-cyan-200"
            />

            <InfoCard label="Your odds" value={yourOdds} valueClass="text-white" />

            <InfoCard
              label="CTR"
              value={`${safeCtr.toFixed(2)}%`}
              valueClass="text-white"
            />

            {typeof lifetimeEntries === "number" ? (
              <InfoCard
                label="Lifetime"
                value={String(lifetimeEntries)}
                valueClass="text-white/80"
              />
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                Last winner
              </div>
              <div className="mt-2 break-words text-2xl font-black uppercase leading-tight text-white">
                {lastDrawWinner ?? "Waiting for first draw"}
              </div>
              <div className="mt-2 text-sm leading-snug text-white/60">
                {formatLastDrawTime(lastDrawAt)}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                Sponsor clicks
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <ClickStat label="Total" value={safeStats.totalClicks} />
                <ClickStat label="Session" value={safeStats.sessionClicks} />
                <ClickStat label="Today" value={safeStats.dailyClicks} />

                <div className="min-w-0">
                  <div className="text-xs text-white/45">Last click</div>
                  <div className="break-words text-sm font-medium leading-snug text-white/80">
                    {formatLastClickTime(safeStats.lastClickAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoCard({
  label,
  value,
  valueClass,
  note,
  highlight,
}: {
  label: string;
  value: string;
  valueClass: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 ${
        highlight
          ? "border-amber-300/20 bg-amber-500/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="break-words text-xs uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
      <div className={`mt-2 break-words text-3xl font-black leading-tight ${valueClass}`}>
        {value}
      </div>
      {note ? <div className="mt-2 text-xs leading-snug text-white/50">{note}</div> : null}
    </div>
  );
}

function ClickStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs text-white/45">{label}</div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}