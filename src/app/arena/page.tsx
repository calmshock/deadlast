"use client";

import Header from "@/components/deadlast/Header";
import HeroPanel from "@/components/deadlast/HeroPanel";
import PlayersSection from "@/components/deadlast/PlayersSection";
import RoundStatusPanel from "@/components/deadlast/RoundStatusPanel";
import ResultsPanel from "@/components/deadlast/ResultsPanel";
import RoundLogPanel from "@/components/deadlast/RoundLogPanel";
import ResultModal from "@/components/deadlast/ResultModal";
import PickModal from "@/components/deadlast/PickModal";
import EntryToast from "@/components/deadlast/EntryToast";
import PlayerHud from "@/components/deadlast/PlayerHud";
import HandReveal from "@/components/deadlast/HandReveal";
import { useDeadlastGame } from "@/hooks/useDeadlastGame";
import type { Move } from "@/types/game";

export default function ArenaPage() {
  const game = useDeadlastGame();

  function handlePick(pick: Move) {
    game.chooseMove(pick);
  }

  const showPickModal = game.showPickModal && !game.showResultModal;

  const odds =
    game.drawPoolEntries > 0 && game.entries > 0
      ? `${((game.entries / game.drawPoolEntries) * 100).toFixed(2)}%`
      : "0.00%";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#18181b_0%,#000_70%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          balance={game.balance}
          entries={game.entries}
          entriesDelta={game.entriesEarnedThisMatch}
        />

        <PlayerHud
          balance={game.balance}
          entries={game.entries}
          lifetimeEntries={game.lifetimeEntries}
          odds={odds}
          countdown="Daily Draw Live"
        />

        <div className="mt-6 space-y-6">
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

          <HandReveal
            players={game.players}
            activeIds={game.activeIds}
            placements={game.placements}
            phase={game.phase}
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
            arenaPreferredPick={game.arenaProfile.preferredPick}
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
