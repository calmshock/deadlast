"use client";

import Header from "@/components/deadlast/Header";
import HeroPanel from "@/components/deadlast/HeroPanel";
import PlayersSection from "@/components/deadlast/PlayersSection";
import RoundStatusPanel from "@/components/deadlast/RoundStatusPanel";
import ResultsPanel from "@/components/deadlast/ResultsPanel";
import RoundLogPanel from "@/components/deadlast/RoundLogPanel";
import DailyDrawPanel from "@/components/deadlast/DailyDrawPanel";
import ResultModal from "@/components/deadlast/ResultModal";
import PickModal from "@/components/deadlast/PickModal";
import EntryToast from "@/components/deadlast/EntryToast";
import HandReveal from "@/components/deadlast/HandReveal";
import { useDeadlastGame } from "@/hooks/useDeadlastGame";
import type { Move } from "@/types/game";

export default function HomePage() {
  const game = useDeadlastGame();

  function handlePick(pick: Move) {
    game.chooseMove(pick);
  }

  const showPickModal = game.showPickModal && !game.showResultModal;

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          balance={game.balance}
          entries={game.entries}
          entriesDelta={game.entriesEarnedThisMatch}
        />

        <div className="mt-6 grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
            />

            <PlayersSection
              players={game.players}
              phase={game.phase}
              activeIds={game.activeIds}
              placements={game.placements}
              results={game.results}
              userCycleEntries={game.entries}
              userLifetimeEntries={game.lifetimeEntries}
              entriesAwardEligible={game.entriesAwardEligible}
              entriesEarnedThisMatch={game.entriesEarnedThisMatch}
              arenaAutoEnabled={game.arenaProfile.auto}
              arenaGamesPlayed={game.arenaProfile.gamesPlayed}
              arenaWins={game.arenaProfile.wins}
              arenaSeconds={game.arenaProfile.seconds}
              arenaThirds={game.arenaProfile.thirds}
              arenaPreferredPick={game.arenaProfile.preferredPick}            />

            <HandReveal
              players={game.players}
              activeIds={game.activeIds}
              placements={game.placements}
              phase={game.phase}
            />

            <RoundStatusPanel
              phase={game.phase}
              stage={game.stage}
              message={game.message}
              buyIn={game.buyIn}
            />

            <ResultsPanel
              results={game.results}
              entriesAwardEligible={game.entriesAwardEligible}
              entriesEarnedThisMatch={game.entriesEarnedThisMatch}
            />

            <RoundLogPanel roundLog={game.roundLog} />
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
              sponsorClickStats={game.sponsorClickStats}
              handleSponsorClick={game.handleSponsorClick}
              recordImpression={game.recordImpression}
              ctr={game.ctr}
              exportSponsorReport={game.exportSponsorReport}
            />
          </aside>
        </div>
      </div>

      {showPickModal && (
        <PickModal
          players={game.players}
          activePlayers={game.activePlayers}
          placements={game.placements}
          phase={game.phase}
          stage={game.stage}
          message={game.message}
          timer={game.timer}
          moveStats={game.moveStats}
          onPick={handlePick}
        />
      )}

      <ResultModal
        show={game.showResultModal}
        finishContext={game.finishContext}
        modalSummary={game.modalSummary}
        autoPlayEnabled={game.autoPlayEnabled}
        autoPlayDelay={game.autoPlayDelay}
        entriesAwardEligible={game.entriesAwardEligible}
        entriesEarnedThisMatch={game.entriesEarnedThisMatch}
        setShowResultModal={game.setShowResultModal}
        setAutoPlayEnabled={game.setAutoPlayEnabled}
        setAutoPlayDelay={game.setAutoPlayDelay}
        playAgain={game.playAgain}
      />

      {game.entryToast && <EntryToast amount={game.entryToast.amount} />}
    </main>
  );
}







