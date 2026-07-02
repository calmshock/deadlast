"use client";

import { useEffect } from "react";
import Header from "@/components/deadlast/Header";
import ResultModal from "@/components/deadlast/ResultModal";
import EntryToast from "@/components/deadlast/EntryToast";
import ArenaStage from "@/components/deadlast/ArenaStage";
import AnimatedArena from "@/components/deadlast/animated-arena/AnimatedArena";
import { buildArenaPlayers } from "@/components/deadlast/animated-arena/arenaViewModel";
import { beatFromPhase } from "@/components/deadlast/animated-arena/types";
import ArenaMoveControls from "@/components/deadlast/animated-arena/ArenaMoveControls";
import { useDeadlastGame } from "@/hooks/useDeadlastGame";
import type { Move } from "@/types/game";

export default function ArenaPage() {
  const game = useDeadlastGame();

  useEffect(() => {
    if (!game.mounted) return;
    if (game.phase !== "lobby") return;

    game.startMatch();
  }, [game.mounted, game.phase]);

  function handlePick(pick: Move) {
    game.chooseMove(pick);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Header
          balance={game.balance}
          entries={game.entries}
          entriesDelta={game.entriesEarnedThisMatch}
        />

        <div className="mt-6 space-y-6">
          <AnimatedArena
            players={buildArenaPlayers({
              players: game.players,
              activeIds: game.activeIds,
              placements: game.placements,
              balance: game.balance,
            })}
            beat={beatFromPhase(game.phase)}
            seconds={game.timer}
            currentPlayerId={game.players.find((player) => player.isUser)?.id}
          />
          <ArenaMoveControls
            phase={game.phase}
            onPick={handlePick}
          />

          <ArenaStage
            players={game.players}
            activeIds={game.activeIds}
            placements={game.placements}
            phase={game.phase}
            timer={game.timer}
            onPick={handlePick}
          />
        </div>
      </div>

      <ResultModal
        show={game.showResultModal}
        finishContext={game.finishContext}
        modalSummary={game.modalSummary}
        autoPlayEnabled={game.autoPlayEnabled}
        autoPlayDelay={game.autoPlayDelay}
        entriesAwardEligible={game.entriesAwardEligible}
        entriesEarnedThisMatch={game.entriesEarnedThisMatch}
        setShowResultModal={() => { window.location.href = "/"; }}
        setAutoPlayEnabled={game.setAutoPlayEnabled}
        setAutoPlayDelay={game.setAutoPlayDelay}
        playAgain={game.playAgain}
      />

      <EntryToast toast={game.entryToast} />
    </main>
  );
}



