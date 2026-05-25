"use client";

import Header from "@/components/deadlast/Header";
import HeroPanel from "@/components/deadlast/HeroPanel";
import DailyDrawPanel from "@/components/deadlast/DailyDrawPanel";
import { useDeadlastGame } from "@/hooks/useDeadlastGame";

export default function HomePage() {
  const game = useDeadlastGame();

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          balance={game.balance}
          entries={game.entries}
          entriesDelta={game.entriesEarnedThisMatch}
        />

        <div className="mt-6 grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 space-y-6">
            <HeroPanel
              buyIn={game.buyIn}
              houseCut={game.houseCut}
              phase={game.phase}
              playerCount={game.playerCount}
              setPlayerCount={game.setPlayerCount}
              autoPlayEnabled={game.autoPlayEnabled}
              autoPlayDelay={game.autoPlayDelay}
              setBuyIn={game.setBuyIn}
              startMatch={game.startMatch}
              setAutoPlayEnabled={game.setAutoPlayEnabled}
              setAutoPlayDelay={game.setAutoPlayDelay}
              ctaLabel="Enter Arena"
              ctaHref="/arena"
            />

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">
                Daily redemption loop
              </div>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Lose manually. Earn entries. Win the daily draw.
              </h2>

              <p className="mt-3 max-w-3xl text-white/65">
                Manual last-place finishes earn prize entries for the current daily cycle.
                Auto-picked moves do not qualify. Entries reset every cycle.
              </p>
            </section>
          </section>

          <aside className="min-w-0 xl:sticky xl:top-5 xl:self-start">
            <DailyDrawPanel
              entries={game.entries}
              lifetimeEntries={game.lifetimeEntries}
              dailyDrawPrize={game.dailyDrawPrize}
              sponsorSlot={game.sponsorSlot}
              drawPoolEntries={game.drawPoolEntries}
              nextDrawAt={game.nextDrawAt}
              lastDrawWinner={game.lastDrawWinner}
              lastDrawAt={game.lastDrawAt}
              rankedWinners={game.rankedWinners}
              runTestDraw={game.runTestDraw}
              sponsorClickStats={game.sponsorClickStats}
              handleSponsorClick={game.handleSponsorClick}
              recordImpression={game.recordImpression}
              ctr={game.ctr}
              exportSponsorReport={game.exportSponsorReport}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
