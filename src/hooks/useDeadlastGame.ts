"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FinishContext,
  Move,
  MoveStats,
  Phase,
  Placement,
  Player,
  ResultRow,
  RoundLogEntry,
  Stage,
} from "@/types/game";
import {
  readArenaProgress,
  writeArenaProgress,
} from "@/lib/arena/progress";

const ROUND_SECONDS = 3;

type EntryToast = {
  id: number;
  amount: number;
};

type SponsorStats = {
  totalClicks: number;
  dailyClicks: number;
  sessionClicks: number;
  totalImpressions: number;
  dailyImpressions: number;
  sessionImpressions: number;
  lastClickAt: number | null;
};

function makeInitialPlayers(): Player[] {
  return [
    {
      id: "you",
      name: "You",
      isUser: true,
      move: null,
      locked: false,
    },
    {
      id: "riot",
      name: "Riot",
      isUser: false,
      move: null,
      locked: false,
    },
    {
      id: "shade",
      name: "Shade",
      isUser: false,
      move: null,
      locked: false,
    },
  ];
}

function makeLogId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomMove(): Move {
  const moves: Move[] = ["rock", "paper", "scissors"];
  return moves[Math.floor(Math.random() * moves.length)];
}

function beats(a: Move, b: Move) {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}

function placementDelta(placement: Placement, buyIn: number) {
  if (placement === 1) return +(buyIn * 0.6).toFixed(2);
  if (placement === 2) return +(buyIn * 0.3).toFixed(2);
  return -buyIn;
}

function buildResults(players: Player[], placements: Partial<Record<string, Placement>>, buyIn: number) {
  return players
    .filter((player) => placements[player.id])
    .map((player) => {
      const placement = placements[player.id] as Placement;

      return {
        name: player.name,
        placement,
        delta: placementDelta(placement, buyIn),
      };
    })
    .sort((a, b) => a.placement - b.placement);
}

export function useDeadlastGame() {
  const [mounted, setMounted] = useState(false);
  const [buyIn, setBuyIn] = useState(1);
  const [balance, setBalance] = useState(100);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [stage, setStage] = useState<Stage>("main");
  const [timer, setTimer] = useState(ROUND_SECONDS);

  const [players, setPlayers] = useState<Player[]>(makeInitialPlayers());
  const [activeIds, setActiveIds] = useState<string[]>(["you", "riot", "shade"]);
  const [placements, setPlacements] = useState<Partial<Record<string, Placement>>>({});
  const [results, setResults] = useState<ResultRow[]>([]);
  const [roundLog, setRoundLog] = useState<RoundLogEntry[]>([]);

  const [message, setMessage] = useState("Only one player loses.");
  const [roundTitle, setRoundTitle] = useState("Main round");
  const [roundSubtext, setRoundSubtext] = useState("Choose your move.");

  const [showResultModal, setShowResultModal] = useState(false);
  const [modalSummary, setModalSummary] = useState<ResultRow[]>([]);
  const [finishContext, setFinishContext] = useState<FinishContext>("final_third");

  const [moveStats, setMoveStats] = useState<Record<string, MoveStats>>({});
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [autoPlayDelay, setAutoPlayDelay] = useState(1500);

  const [entriesAwardEligible, setEntriesAwardEligible] = useState(false);
  const [entriesEarnedThisMatch, setEntriesEarnedThisMatch] = useState(0);
  const [entryToast, setEntryToast] = useState<EntryToast | null>(null);

  const [entries, setEntries] = useState(0);
  const [lifetimeEntries, setLifetimeEntries] = useState(0);

  const [dailyDrawPrize] = useState("$50 Cash");
  const [sponsorSlot] = useState({
    name: "Sponsor Slot",
    tagline: "Your brand could own the daily draw.",
    cta: "Become a Sponsor",
    href: "#",
    imageUrl: "/calgary-lawn-reset-logo.png",
  });
  const [drawPoolEntries] = useState(124);
  const [nextDrawAt] = useState(Date.now() + 1000 * 60 * 60 * 8);
  const [lastDrawWinner] = useState<string | null>(null);
  const [lastDrawAt] = useState<number | null>(null);
  const [sponsorClickStats] = useState<SponsorStats>({
    totalClicks: 0,
    dailyClicks: 0,
    sessionClicks: 0,
    totalImpressions: 0,
    dailyImpressions: 0,
    sessionImpressions: 0,
    lastClickAt: null,
  });

  const [arenaProfile] = useState({
    auto: false,
    wins: 0,
    seconds: 0,
    thirds: 0,
    gamesPlayed: 0,
    preferredPick: null,
  });

  const userMadeManualPickThisMatchRef = useRef(false);
  const userWasAutoPickedThisMatchRef = useRef(false);
  const awardedEntryRef = useRef(false);
  const resolvingRef = useRef(false);

  const houseCut = useMemo(() => +(buyIn * 0.1).toFixed(2), [buyIn]);

  const user = useMemo(() => players.find((player) => player.isUser) ?? null, [players]);

  const activePlayers = useMemo(
    () => players.filter((player) => activeIds.includes(player.id)),
    [players, activeIds],
  );

  const showPickModal =
    phase === "countdown" || phase === "locked" || phase === "revealing";

  const ctr = useMemo(() => {
    if (sponsorClickStats.totalImpressions === 0) return 0;

    return (
      (sponsorClickStats.totalClicks / sponsorClickStats.totalImpressions) * 100
    );
  }, [sponsorClickStats]);

  function syncEntriesFromProgress() {
    const progress = readArenaProgress();

    setEntries(progress.sessionLossEntries);
    setLifetimeEntries(progress.lifetimeLossEntries);
  }

  function appendLog(entry: Omit<RoundLogEntry, "id">) {
    setRoundLog((current) => [
      {
        ...entry,
        id: makeLogId(),
      },
      ...current,
    ]);
  }

  function resetActivePlayersForRound(ids: string[]) {
    setPlayers((current) =>
      current.map((player) => {
        if (!ids.includes(player.id)) return player;

        return {
          ...player,
          move: null,
          locked: false,
        };
      }),
    );
  }

  function beginRound(ids: string[], nextStage: Stage, note: string) {
    resolvingRef.current = false;
    setActiveIds(ids);
    setStage(nextStage);
    resetActivePlayersForRound(ids);
    setTimer(ROUND_SECONDS);
    setPhase("countdown");
    setMessage(note);

    if (nextStage === "main") {
      setRoundTitle("Main round");
      setRoundSubtext("Choose your move.");
    } else if (nextStage === "winners") {
      setRoundTitle("Winners round");
      setRoundSubtext("Playing for 1st and 2nd.");
    } else {
      setRoundTitle("Losers round");
      setRoundSubtext("Playing for 2nd and 3rd.");
    }
  }

  function awardEntryIfNeeded(finalResults: ResultRow[]) {
    const yourResult = finalResults.find((result) => result.name === "You");
    const eligible =
      userMadeManualPickThisMatchRef.current &&
      !userWasAutoPickedThisMatchRef.current;

    setEntriesAwardEligible(eligible);

    if (!yourResult) {
      setEntriesEarnedThisMatch(0);
      syncEntriesFromProgress();
      return;
    }

    const earned = eligible && yourResult.placement === 3 ? 1 : 0;

    setEntriesEarnedThisMatch(earned);

    if (earned <= 0 || awardedEntryRef.current) {
      syncEntriesFromProgress();
      return;
    }

    const progress = readArenaProgress();

    const nextProgress = {
      ...progress,
      sessionLossEntries: progress.sessionLossEntries + 1,
      lifetimeLossEntries: progress.lifetimeLossEntries + 1,
      sessionEligibleLosses: progress.sessionEligibleLosses + 1,
      lifetimeEligibleLosses: progress.lifetimeEligibleLosses + 1,
      lastUpdatedAt: Date.now(),
    };

    awardedEntryRef.current = true;
    writeArenaProgress(nextProgress);

    setEntryToast({
      id: Date.now(),
      amount: earned,
    });

    appendLog({
      title: "Entry earned",
      subtitle: "Prize cycle",
      picks: [],
      outcome: "You earned 1 entry toward the current draw.",
    });

    syncEntriesFromProgress();
  }

  function finishMatch(finalPlacements: Partial<Record<string, Placement>>) {
    const finalResults = buildResults(players, finalPlacements, buyIn);
    const yourResult = finalResults.find((result) => result.name === "You");

    setResults(finalResults);
    setModalSummary(finalResults);

    if (yourResult) {
      setBalance((current) => +(current + yourResult.delta).toFixed(2));

      if (yourResult.placement === 1) setFinishContext("final_first");
      else if (yourResult.placement === 2) setFinishContext("final_second");
      else setFinishContext("final_third");
    }

    awardEntryIfNeeded(finalResults);

    setTimeout(() => {
      setPhase("results");
      setShowResultModal(true);
    }, 800);
  }

  function resolveCurrentRound() {
    const currentActivePlayers = players.filter((player) =>
      activeIds.includes(player.id),
    );

    const currentPicks = currentActivePlayers.map((player) => ({
      name: player.name,
      move: player.move,
    }));

    const uniqueMoves = [...new Set(currentActivePlayers.map((player) => player.move))];

    if (uniqueMoves.length !== 2) {
      appendLog({
        title: stage === "main" ? "3-way tie" : "Tied round",
        subtitle: "Replay",
        picks: currentPicks,
        outcome: "No clear result. Replaying this round.",
      });

      beginRound(activeIds, stage, "Tie round. Pick again.");
      return;
    }

    const firstMove = uniqueMoves[0] as Move;
    const secondMove = uniqueMoves[1] as Move;
    const winningMove = beats(firstMove, secondMove) ? firstMove : secondMove;
    const losingMove = winningMove === firstMove ? secondMove : firstMove;

    const winners = currentActivePlayers.filter((player) => player.move === winningMove);
    const losers = currentActivePlayers.filter((player) => player.move === losingMove);

    appendLog({
      title: stage === "main" ? "Main round" : "Tie-break",
      subtitle: "Resolved",
      picks: currentPicks,
      outcome: `${winners.map((p) => p.name).join(", ")} beat ${losers
        .map((p) => p.name)
        .join(", ")}.`,
    });

    if (stage === "main") {
      if (winners.length === 1) {
        const nextPlacements = {
          ...placements,
          [winners[0].id]: 1 as Placement,
        };

        setPlacements(nextPlacements);
        beginRound(
          losers.map((player) => player.id),
          "losers",
          "Winner locked 1st. Remaining players are playing for 2nd and 3rd.",
        );
        return;
      }

      if (losers.length === 1) {
        const nextPlacements = {
          ...placements,
          [losers[0].id]: 3 as Placement,
        };

        setPlacements(nextPlacements);
        beginRound(
          winners.map((player) => player.id),
          "winners",
          "Loser locked 3rd. Remaining players are playing for 1st and 2nd.",
        );
        return;
      }
    }

    if (stage === "winners") {
      const nextPlacements = {
        ...placements,
        [winners[0].id]: 1 as Placement,
        [losers[0].id]: 2 as Placement,
      };

      setPlacements(nextPlacements);
      finishMatch(nextPlacements);
      return;
    }

    const nextPlacements = {
      ...placements,
      [winners[0].id]: 2 as Placement,
      [losers[0].id]: 3 as Placement,
    };

    setPlacements(nextPlacements);
    finishMatch(nextPlacements);
  }

  function startMatch() {
    if (!mounted) return;

    setPlayers(makeInitialPlayers());
    setActiveIds(["you", "riot", "shade"]);
    setPlacements({});
    setResults([]);
    setRoundLog([]);
    setMoveStats({});
    setMessage("Lock your move before the timer hits zero.");
    setRoundTitle("Main round");
    setRoundSubtext("Choose your move.");
    setStage("main");
    setTimer(ROUND_SECONDS);
    setPhase("countdown");
    setShowResultModal(false);
    setModalSummary([]);
    setFinishContext("final_third");
    setEntriesAwardEligible(false);
    setEntriesEarnedThisMatch(0);

    userMadeManualPickThisMatchRef.current = false;
    userWasAutoPickedThisMatchRef.current = false;
    awardedEntryRef.current = false;
    resolvingRef.current = false;
  }

  function chooseMove(move: Move) {
    if (phase !== "countdown") return;
    if (!user) return;
    if (!activeIds.includes(user.id)) return;

    userMadeManualPickThisMatchRef.current = true;

    setPlayers((current) =>
      current.map((player) =>
        player.isUser
          ? {
              ...player,
              move,
              locked: true,
            }
          : player,
      ),
    );
  }

  function playAgain() {
    setShowResultModal(false);
    startMatch();
  }

  useEffect(() => {
    setMounted(true);
    syncEntriesFromProgress();
  }, []);

  useEffect(() => {
    if (!entryToast) return;

    const id = window.setTimeout(() => {
      setEntryToast(null);
    }, 2200);

    return () => window.clearTimeout(id);
  }, [entryToast]);

  useEffect(() => {
    if (phase !== "countdown") return;

    if (timer <= 0) {
      setPlayers((current) =>
        current.map((player) => {
          if (!activeIds.includes(player.id)) return player;

          if (player.isUser && !player.move) {
            userWasAutoPickedThisMatchRef.current = true;
          }

          return {
            ...player,
            move: player.move ?? randomMove(),
            locked: true,
          };
        }),
      );

      setPhase("locked");
      return;
    }

    const id = window.setTimeout(() => {
      setTimer((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(id);
  }, [phase, timer, activeIds]);

  useEffect(() => {
    if (phase !== "locked") return;

    const id = window.setTimeout(() => {
      setMessage("Revealing...");
      setPhase("revealing");
    }, 450);

    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;
    if (resolvingRef.current) return;

    resolvingRef.current = true;

    const id = window.setTimeout(() => {
      resolveCurrentRound();
    }, 800);

    return () => window.clearTimeout(id);
  }, [phase, players, activeIds, placements, stage, buyIn]);

  useEffect(() => {
    if (!showResultModal || !autoPlayEnabled) return;

    const id = window.setTimeout(() => {
      setShowResultModal(false);
      startMatch();
    }, autoPlayDelay);

    return () => window.clearTimeout(id);
  }, [showResultModal, autoPlayEnabled, autoPlayDelay]);

  const handleSponsorClick = useCallback(() => {}, []);
  const recordImpression = useCallback(() => {}, []);
  const exportSponsorReport = useCallback(() => {}, []);

  return {
    mounted,
    buyIn,
    setBuyIn,
    balance,
    entries,
    lifetimeEntries,
    arenaProfile,
    phase,
    stage,
    timer,
    players,
    activeIds,
    placements,
    results,
    roundLog,
    message,
    roundTitle,
    roundSubtext,
    showResultModal,
    setShowResultModal,
    modalSummary,
    finishContext,
    moveStats,
    autoPlayEnabled,
    setAutoPlayEnabled,
    autoPlayDelay,
    setAutoPlayDelay,
    entriesAwardEligible,
    entriesEarnedThisMatch,
    entryToast,
    user,
    activePlayers,
    houseCut,
    showPickModal,
    startMatch,
    chooseMove,
    playAgain,
    dailyDrawPrize,
    sponsorSlot,
    drawPoolEntries,
    nextDrawAt,
    lastDrawWinner,
    lastDrawAt,
    sponsorClickStats,
    handleSponsorClick,
    recordImpression,
    ctr,
    exportSponsorReport,
  };
}