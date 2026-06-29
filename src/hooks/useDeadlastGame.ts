"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FinishContext,
  GameMode,
  Move,
  MoveStats,
  Phase,
  Placement,
  Player,
  ResultRow,
  RoundLogEntry,
  Stage,
} from "@/types/game";

import { BOT_NAMES, ROUND_SECONDS } from "@/types/game";
import { useArenaProgress } from "@/contexts/ArenaProgressContext";
import { payoutForPlacement } from "@/lib/payouts";
import {
  buildDrawEntries,
  runRankedDailyDraw,
} from "@/lib/draws/daily";

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

function makeLogId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createPlayers(playerCount: GameMode): Player[] {
  const base: Player[] = [
    {
      id: "you",
      name: "You",
      isUser: true,
      move: null,
      locked: false,
    },
  ];

  for (let i = 0; i < playerCount - 1; i++) {
    base.push({
      id: `bot-${i}`,
      name: BOT_NAMES[i],
      isUser: false,
      move: null,
      locked: false,
    });
  }

  return base;
}

function getWinnerAndLoserMoves(moves: Move[]) {
  const uniqueMoves = [...new Set(moves)];

  if (uniqueMoves.length !== 2) return null;

  const first = uniqueMoves[0];
  const second = uniqueMoves[1];

  const winnerMove = beats(first, second) ? first : second;
  const loserMove = winnerMove === first ? second : first;

  return {
    winnerMove,
    loserMove,
  };
}

function ordinal(place: Placement) {
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  if (place === 3) return "3rd";
  return "4th";
}

function resolveHiddenHeadToHead(
  players: Player[],
  ids: string[],
  places: Placement[],
): Partial<Record<string, Placement>> {
  const hiddenPlayers = players.filter((player) => ids.includes(player.id));

  for (let attempt = 0; attempt < 20; attempt++) {
    const picked = hiddenPlayers.map((player) => ({
      ...player,
      move: randomMove(),
      locked: true,
    }));

    const outcome = getWinnerAndLoserMoves(
      picked.map((player) => player.move as Move),
    );

    if (!outcome) continue;

    const winner = picked.find((player) => player.move === outcome.winnerMove);
    const loser = picked.find((player) => player.move === outcome.loserMove);

    if (!winner || !loser) continue;

    return {
      [winner.id]: places[0],
      [loser.id]: places[1],
    };
  }

  return {
    [hiddenPlayers[0].id]: places[0],
    [hiddenPlayers[1].id]: places[1],
  };
}

export function useDeadlastGame() {
  const arenaProgress = useArenaProgress();
  const [mounted, setMounted] = useState(false);
  const [playerCount, setPlayerCount] = useState<GameMode>(3);
  const [buyIn, setBuyIn] = useState(1);
  const [balance, setBalance] = useState(100);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [stage, setStage] = useState<Stage>("main");
  const [timer, setTimer] = useState(ROUND_SECONDS);
  const [players, setPlayers] = useState<Player[]>(createPlayers(3));
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [placements, setPlacements] = useState<Partial<Record<string, Placement>>>({});
  const [results, setResults] = useState<ResultRow[]>([]);
  const [roundLog, setRoundLog] = useState<RoundLogEntry[]>([]);
  const [message, setMessage] = useState("Only one player loses.");
  const [roundTitle, setRoundTitle] = useState("Main round");
  const [roundSubtext, setRoundSubtext] = useState("Choose your move.");
  const [showResultModal, setShowResultModal] = useState(false);
  const [modalSummary, setModalSummary] = useState<ResultRow[]>([]);
  const [finishContext, setFinishContext] = useState<FinishContext>("final_third");
  const [moveStats] = useState<Record<string, MoveStats>>({});
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [autoPlayDelay, setAutoPlayDelay] = useState(1500);
  const [entriesAwardEligible, setEntriesAwardEligible] = useState(false);
  const [entriesEarnedThisMatch, setEntriesEarnedThisMatch] = useState(0);
  const [entryToast, setEntryToast] = useState<EntryToast | null>(null);
  // Entry state now comes from ArenaProgressContext
  // const [entries, setEntries] = useState(0);
  // const [lifetimeEntries, setLifetimeEntries] = useState(0);
  const [dailyDrawPrize] = useState("$50 Cash");
  const [sponsorSlot] = useState({
    name: "Sponsor Slot",
    tagline: "Your brand could own the daily draw.",
    cta: "Become a Sponsor",
    href: "#",
    imageUrl: "/calgary-lawn-reset-logo.png",
  });
  const [drawPoolEntries, setDrawPoolEntries] = useState(124);
  const [simulatePoolActivity, setSimulatePoolActivity] = useState(true);
  const [nextDrawAt, setNextDrawAt] = useState(() => {
    if (typeof window === "undefined") return Date.now() + 1000 * 60 * 60 * 24;

    const saved = window.localStorage.getItem("deadlast:draw:nextDrawAt");

    return saved ? Number(saved) : Date.now() + 1000 * 60 * 60 * 24;
  });
  const [lastDrawWinner, setLastDrawWinner] = useState<string | null>(null);
  const [rankedWinners, setRankedWinners] = useState<
    {
      rank: number;
      playerName: string;
      prize: number;
    }[]
  >([]);
  const [lastDrawAt, setLastDrawAt] = useState<number | null>(null);
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

  const currentPlacesRef = useRef<Placement[]>([1, 2, 3]);
  const hiddenPlacementsRef = useRef<Partial<Record<string, Placement>>>({});
  const userMadeManualPickThisMatchRef = useRef(false);
  const userWasAutoPickedThisMatchRef = useRef(false);
  const awardedEntryRef = useRef(false);
  const resolvingRef = useRef(false);

  // Expose entries from context
  const entries = arenaProgress.progress.sessionLossEntries;
  const lifetimeEntries = arenaProgress.progress.lifetimeLossEntries;

  const user = useMemo(
    () => players.find((player) => player.isUser) ?? null,
    [players],
  );

  const activePlayers = useMemo(
    () => players.filter((player) => activeIds.includes(player.id)),
    [players, activeIds],
  );

  const houseCut = useMemo(() => {
    return +(buyIn * 0.1).toFixed(2);
  }, [buyIn]);

  const showPickModal =
    phase === "countdown" || phase === "locked" || phase === "revealing";

  const ctr = useMemo(() => {
    if (sponsorClickStats.totalImpressions === 0) return 0;

    return (
      (sponsorClickStats.totalClicks / sponsorClickStats.totalImpressions) * 100
    );
  }, [sponsorClickStats]);

  // No longer needed - entries come directly from context
  // function syncEntriesFromProgress() {
  //   const progress = readArenaProgress();
  //   setEntries(progress.sessionLossEntries);
  //   setLifetimeEntries(progress.lifetimeLossEntries);
  // }

  function appendLog(entry: Omit<RoundLogEntry, "id">) {
    setRoundLog((current) => [
      {
        ...entry,
        id: makeLogId(),
      },
      ...current,
    ]);
  }

  function resetPlayersForIds(ids: string[]) {
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

  function beginBracketRound(ids: string[], places: Placement[], note: string) {
    resolvingRef.current = false;
    currentPlacesRef.current = places;
    setActiveIds(ids);
    resetPlayersForIds(ids);
    setTimer(ROUND_SECONDS);
    setPhase("countdown");
    setMessage(note);

    if (places[0] === 1 && places[places.length - 1] === playerCount) {
      setStage("main");
      setRoundTitle("Main round");
      setRoundSubtext("Choose your move.");
    } else if (places[0] === 1) {
      setStage("winners");
      setRoundTitle(places.length === 3 ? "Top bracket continues" : "Top bracket");
      setRoundSubtext(
        places.length === 3
          ? `Three players are still live for ${places.map(ordinal).join(" / ")}.`
          : `Head-to-head for ${places.map(ordinal).join(" / ")}.`
      );
    } else {
      setStage("losers");
      setRoundTitle(places.length === 3 ? "Danger bracket continues" : "Danger bracket");
      setRoundSubtext(
        places.length === 3
          ? `Three players are still live for ${places.map(ordinal).join(" / ")}.`
          : `Head-to-head for ${places.map(ordinal).join(" / ")}.`
      );
    }
  }

  function finishMatch(finalPlacements: Partial<Record<string, Placement>>) {
    const finalResults = players
      .map((player) => {
        const placement = finalPlacements[player.id] as Placement;

        return {
          placement,
          name: player.name,
          delta: payoutForPlacement(buyIn, placement, playerCount),
        };
      })
      .sort((a, b) => a.placement - b.placement);

    setResults(finalResults);
    setModalSummary(finalResults);

    const yourResult = finalResults.find((result) => result.name === "You");

    if (yourResult) {
      setBalance((current) => +(current + yourResult.delta).toFixed(2));

      const lastPlace = playerCount;

      if (yourResult.placement === 1) {
        setFinishContext("final_first");
      } else if (yourResult.placement === lastPlace) {
        setFinishContext("final_third");
      } else {
        setFinishContext("final_second");
      }

      const eligible =
        userMadeManualPickThisMatchRef.current &&
        !userWasAutoPickedThisMatchRef.current;

      setEntriesAwardEligible(eligible);

      const earned = eligible && yourResult.placement === playerCount ? 1 : 0;

      setEntriesEarnedThisMatch(earned);

      if (earned > 0 && !awardedEntryRef.current) {
        awardedEntryRef.current = true;

        // Update progress through context (single source of truth).
        // One atomic update increments session+lifetime loss entries AND
        // eligible losses, mirroring the original inline progress write.
        arenaProgress.recordEligibleManualLoss();

        setEntryToast({
          id: Date.now(),
          amount: 1,
        });

    const savedPool = window.localStorage.getItem("deadlast:draw:poolEntries");
    if (savedPool) setDrawPoolEntries(Number(savedPool));

    const savedWinner = window.localStorage.getItem("deadlast:draw:lastWinner");
    if (savedWinner) setLastDrawWinner(savedWinner);

    const savedLastDrawAt = window.localStorage.getItem("deadlast:draw:lastDrawAt");
    if (savedLastDrawAt) setLastDrawAt(Number(savedLastDrawAt));

    const savedWinners = window.localStorage.getItem("deadlast:draw:winners");
    if (savedWinners) {
      try {
        setRankedWinners(JSON.parse(savedWinners));
      } catch {}
    }

    setDrawPoolEntries(0);
    window.localStorage.setItem("deadlast:draw:poolEntries", "0");

    const nextCycle = Date.now() + 1000 * 60 * 60 * 24;
    setNextDrawAt(nextCycle);
    window.localStorage.setItem("deadlast:draw:nextDrawAt", String(nextCycle));
      }
    }

    setTimeout(() => {
      setPhase("results");
      setShowResultModal(true);
    }, 1200);
  }

  function maybeFinishOrContinue(nextPlacements: Partial<Record<string, Placement>>) {
    const assignedCount = Object.keys(nextPlacements).length;

    setPlacements(nextPlacements);

    if (assignedCount >= playerCount) {
      finishMatch(nextPlacements);
    }
  }

  function resolveHeadToHead(
    roundPlayers: Player[],
    places: Placement[],
    nextPlacements: Partial<Record<string, Placement>>,
  ) {
    const outcome = getWinnerAndLoserMoves(roundPlayers.map((player) => player.move as Move));

    if (!outcome) {
      appendLog({
        title: roundTitle,
        subtitle: "Replay",
        outcome: "Both players matched. Replaying this bracket.",
        picks: roundPlayers.map((player) => ({
          name: player.name,
          move: player.move,
        })),
      });

      beginBracketRound(
        roundPlayers.map((player) => player.id),
        places,
        "Tie round. Pick again.",
      );

      return;
    }

    const winner = roundPlayers.find((player) => player.move === outcome.winnerMove);
    const loser = roundPlayers.find((player) => player.move === outcome.loserMove);

    if (!winner || !loser) return;

    const resolvedPlacements = {
      ...nextPlacements,
      [winner.id]: places[0],
      [loser.id]: places[1],
    };

    appendLog({
      title: roundTitle,
      subtitle: "Resolved",
      outcome: `${winner.name} takes ${ordinal(places[0])}. ${loser.name} takes ${ordinal(
        places[1],
      )}.`,
      picks: roundPlayers.map((player) => ({
        name: player.name,
        move: player.move,
      })),
    });

    maybeFinishOrContinue(resolvedPlacements);
  }

  function resolveThreePlayerBracket(
    roundPlayers: Player[],
    places: Placement[],
    nextPlacements: Partial<Record<string, Placement>>,
  ) {
    const outcome = getWinnerAndLoserMoves(roundPlayers.map((player) => player.move as Move));

    if (!outcome) {
      appendLog({
        title: roundTitle,
        subtitle: "Replay",
        outcome: "No clean split formed. Replaying this bracket.",
        picks: roundPlayers.map((player) => ({
          name: player.name,
          move: player.move,
        })),
      });

      beginBracketRound(
        roundPlayers.map((player) => player.id),
        places,
        "No clean split. Pick again.",
      );

      return;
    }

    const winners = roundPlayers.filter((player) => player.move === outcome.winnerMove);
    const losers = roundPlayers.filter((player) => player.move === outcome.loserMove);

    appendLog({
      title: roundTitle,
      subtitle: "Resolved",
      outcome: `${winners.map((p) => p.name).join(", ")} defeated ${losers
        .map((p) => p.name)
        .join(", ")}.`,
      picks: roundPlayers.map((player) => ({
        name: player.name,
        move: player.move,
      })),
    });

    if (winners.length === 1) {
      const updatedPlacements = {
        ...nextPlacements,
        [winners[0].id]: places[0],
      };

      setPlacements(updatedPlacements);

      beginBracketRound(
        losers.map((player) => player.id),
        (playerCount === 4 && places.join(",") === "2,3,4" ? [3, 4] : places.slice(1)),
        `${winners[0].name} secured ${ordinal(places[0])}. Bracket continues for ${places
          .slice(1)
          .map(ordinal)
          .join(" / ")}.`,
      );

      return;
    }

    if (losers.length === 1) {
      const updatedPlacements = {
        ...nextPlacements,
        [losers[0].id]: places[places.length - 1],
      };

      setPlacements(updatedPlacements);

      beginBracketRound(
        winners.map((player) => player.id),
        (playerCount === 4 && places.join(",") === "1,2,3" ? [1, 2] : places.slice(0, -1)),
        `${losers[0].name} dropped into ${ordinal(
          places[places.length - 1],
        )}. Remaining players are battling for ${places
          .slice(0, -1)
          .map(ordinal)
          .join(" / ")}.`,
      );
    }
  }

  function resolveFourPlayerMain(
    roundPlayers: Player[],
    nextPlacements: Partial<Record<string, Placement>>,
  ) {
    const outcome = getWinnerAndLoserMoves(
      roundPlayers.map((player) => player.move as Move),
    );

    if (!outcome) {
      appendLog({
        title: "Main round",
        subtitle: "Replay",
        outcome: "No valid bracket split formed. All four players replay the round.",
        picks: roundPlayers.map((player) => ({
          name: player.name,
          move: player.move,
        })),
      });

      beginBracketRound(
        players.map((player) => player.id),
        [1, 2, 3, 4],
        "No clean split formed. Replaying all four players.",
      );

      return;
    }

    const winners = roundPlayers.filter(
      (player) => player.move === outcome.winnerMove,
    );
    const losers = roundPlayers.filter(
      (player) => player.move === outcome.loserMove,
    );

    appendLog({
      title: "Main round",
      subtitle: "Bracket split",
      outcome: `${winners.map((p) => p.name).join(", ")} defeated ${losers
        .map((p) => p.name)
        .join(", ")}.`,
      picks: roundPlayers.map((player) => ({
        name: player.name,
        move: player.move,
      })),
    });

    if (winners.length === 1) {
      const updatedPlacements = {
        ...nextPlacements,
        [winners[0].id]: 1 as Placement,
      };

      setPlacements(updatedPlacements);

      beginBracketRound(
        losers.map((player) => player.id),
        [2, 3, 4],
        `${winners[0].name} secured 1st place. Remaining players are battling for 2nd / 3rd / 4th.`,
      );

      return;
    }

    if (losers.length === 1) {
      const updatedPlacements = {
        ...nextPlacements,
        [losers[0].id]: 4 as Placement,
      };

      setPlacements(updatedPlacements);

      beginBracketRound(
        winners.map((player) => player.id),
        [1, 2, 3],
        `${losers[0].name} was eliminated into 4th place. Remaining players are battling for 1st / 2nd / 3rd.`,
      );

      return;
    }

    const userInWinners = winners.some((player) => player.isUser);
    const visibleBracket = userInWinners ? winners : losers;
    const hiddenBracket = userInWinners ? losers : winners;
    const visiblePlaces: Placement[] = userInWinners ? [1, 2] : [3, 4];
    const hiddenPlaces: Placement[] = userInWinners ? [3, 4] : [1, 2];

    const hiddenResolved = resolveHiddenHeadToHead(
      roundPlayers,
      hiddenBracket.map((player) => player.id),
      hiddenPlaces,
    );

    hiddenPlacementsRef.current = hiddenResolved;

    setPlacements({
      ...nextPlacements,
      ...hiddenResolved,
    });

    const topNames = winners.map((p) => p.name).join(" & ");
    const dangerNames = losers.map((p) => p.name).join(" & ");

    appendLog({
      title: "Bracket split",
      subtitle: "Simultaneous matches",
      outcome: `Top bracket: ${topNames}. Danger bracket: ${dangerNames}.`,
      picks: roundPlayers.map((player) => ({
        name: player.name,
        move: player.move,
      })),
    });

    beginBracketRound(
      visibleBracket.map((player) => player.id),
      visiblePlaces,
      userInWinners
        ? "You advanced to the TOP BRACKET. Playing for 1st / 2nd while the danger bracket resolves simultaneously."
        : "You dropped into the DANGER BRACKET. Playing for 3rd / 4th while the top bracket resolves simultaneously.",
    );
  }

  function resolveRound() {
    const roundPlayers = players
      .filter((player) => activeIds.includes(player.id))
      .map((player) => ({
        ...player,
        move: player.move ?? randomMove(),
        locked: true,
      }));

    setPlayers((current) =>
      current.map((player) => {
        const updated = roundPlayers.find((p) => p.id === player.id);
        return updated ?? player;
      }),
    );

    const places = currentPlacesRef.current;
    const nextPlacements = {
      ...placements,
      ...hiddenPlacementsRef.current,
    };

    if (roundPlayers.length === 2) {
      resolveHeadToHead(roundPlayers, places, nextPlacements);
      return;
    }

    if (roundPlayers.length === 3) {
      resolveThreePlayerBracket(roundPlayers, places, nextPlacements);
      return;
    }

    resolveFourPlayerMain(roundPlayers, nextPlacements);
  }

  function startMatch() {
    if (!mounted) return;

    const nextPlayers = createPlayers(playerCount);
    const nextPlaces = Array.from(
      { length: playerCount },
      (_, index) => (index + 1) as Placement,
    );

    currentPlacesRef.current = nextPlaces;
    hiddenPlacementsRef.current = {};

    setPlayers(nextPlayers);
    setActiveIds(nextPlayers.map((player) => player.id));
    setPlacements({});
    setResults([]);
    setRoundLog([]);
    setMessage("Lock your move before the timer hits zero.");
    setRoundTitle("Main round");
    setRoundSubtext("Choose your move.");
    setTimer(ROUND_SECONDS);
    setPhase("countdown");
    setStage("main");
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

    const savedPlayerCount = window.localStorage.getItem("deadlast:lobby:playerCount");
    const savedBuyIn = window.localStorage.getItem("deadlast:lobby:buyIn");
    const savedAutoPlayEnabled = window.localStorage.getItem("deadlast:lobby:autoPlayEnabled");
    const savedAutoPlayDelay = window.localStorage.getItem("deadlast:lobby:autoPlayDelay");

    if (savedPlayerCount === "2" || savedPlayerCount === "3" || savedPlayerCount === "4") {
      setPlayerCount(Number(savedPlayerCount) as GameMode);
      setPlayers(createPlayers(Number(savedPlayerCount) as GameMode));
    }

    if (savedBuyIn) {
      setBuyIn(Number(savedBuyIn));
    }

    if (savedAutoPlayEnabled) {
      setAutoPlayEnabled(savedAutoPlayEnabled === "true");
    }

    if (savedAutoPlayDelay) {
      setAutoPlayDelay(Number(savedAutoPlayDelay));
    }

    const savedBalance = window.localStorage.getItem("deadlast:balance");
    if (savedBalance) {
      setBalance(Number(savedBalance));
    }
    // Entries now automatically synced from context

    const savedPool = window.localStorage.getItem("deadlast:draw:poolEntries");
    if (savedPool) setDrawPoolEntries(Number(savedPool));

    const savedWinner = window.localStorage.getItem("deadlast:draw:lastWinner");
    if (savedWinner) setLastDrawWinner(savedWinner);

    const savedLastDrawAt = window.localStorage.getItem("deadlast:draw:lastDrawAt");
    if (savedLastDrawAt) setLastDrawAt(Number(savedLastDrawAt));

    const savedWinners = window.localStorage.getItem("deadlast:draw:winners");
    if (savedWinners) {
      try {
        setRankedWinners(JSON.parse(savedWinners));
      } catch {}
    }

    setDrawPoolEntries(0);
    window.localStorage.setItem("deadlast:draw:poolEntries", "0");

    const nextCycle = Date.now() + 1000 * 60 * 60 * 24;
    setNextDrawAt(nextCycle);
    window.localStorage.setItem("deadlast:draw:nextDrawAt", String(nextCycle));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem("deadlast:balance", String(balance));
  }, [balance]);

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
      resolveRound();
    }, 1800);

    return () => window.clearTimeout(id);
  }, [phase, players, activeIds, placements]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() >= nextDrawAt) {
        runTestDraw();
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [nextDrawAt, entries]);

  useEffect(() => {
    if (!simulatePoolActivity) return;

    const id = window.setInterval(() => {
      setDrawPoolEntries((current) => {
        const next = current + Math.floor(Math.random() * 3) + 1;
        window.localStorage.setItem("deadlast:draw:poolEntries", String(next));
        return next;
      });
    }, 5000);

    return () => window.clearInterval(id);
  }, [simulatePoolActivity]);

  useEffect(() => {
    if (!showResultModal || !autoPlayEnabled) return;

    const id = window.setTimeout(() => {
      setShowResultModal(false);
      startMatch();
    }, autoPlayDelay);

    return () => window.clearTimeout(id);
  }, [showResultModal, autoPlayEnabled, autoPlayDelay]);

  function runTestDraw() {
    const simulatedPool = [
      ...buildDrawEntries("You", entries),
      ...buildDrawEntries("Nova", 14),
      ...buildDrawEntries("Ghost", 9),
      ...buildDrawEntries("Rogue", 6),
      ...buildDrawEntries("Cipher", 4),
      ...buildDrawEntries("Blitz", 3),
      ...buildDrawEntries("Vex", 2),
    ];

    const winners = runRankedDailyDraw(simulatedPool);

    setRankedWinners(winners);
    window.localStorage.setItem("deadlast:draw:winners", JSON.stringify(winners));

    const winnerName = winners[0]?.playerName ?? null;
    setLastDrawWinner(winnerName);
    window.localStorage.setItem("deadlast:draw:lastWinner", winnerName ?? "");

    const completedAt = Date.now();

    setLastDrawAt(completedAt);
    window.localStorage.setItem("deadlast:draw:lastDrawAt", String(completedAt));

    const yourPrize = winners
      .filter((winner) => winner.playerName === "You")
      .reduce((total, winner) => total + winner.prize, 0);

    if (yourPrize > 0) {
      setBalance((current) => +(current + yourPrize).toFixed(2));
    }

    // Reset session progress through context
    arenaProgress.resetSessionProgress();

    const savedPool = window.localStorage.getItem("deadlast:draw:poolEntries");
    if (savedPool) setDrawPoolEntries(Number(savedPool));

    const savedWinner = window.localStorage.getItem("deadlast:draw:lastWinner");
    if (savedWinner) setLastDrawWinner(savedWinner);

    const savedLastDrawAt = window.localStorage.getItem("deadlast:draw:lastDrawAt");
    if (savedLastDrawAt) setLastDrawAt(Number(savedLastDrawAt));

    const savedWinners = window.localStorage.getItem("deadlast:draw:winners");
    if (savedWinners) {
      try {
        setRankedWinners(JSON.parse(savedWinners));
      } catch {}
    }

    setDrawPoolEntries(0);
    window.localStorage.setItem("deadlast:draw:poolEntries", "0");

    const nextCycle = Date.now() + 1000 * 60 * 60 * 24;
    setNextDrawAt(nextCycle);
    window.localStorage.setItem("deadlast:draw:nextDrawAt", String(nextCycle));

    console.log("DAILY DRAW RESULTS", winners);
  }

  const handleSponsorClick = useCallback(() => {}, []);
  const recordImpression = useCallback(() => {}, []);
  const exportSponsorReport = useCallback(() => {}, []);

  return {
    mounted,

    playerCount,
    setPlayerCount,

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
    simulatePoolActivity,
    setSimulatePoolActivity,

    nextDrawAt,

    lastDrawWinner,
    lastDrawAt,
    rankedWinners,
    runTestDraw,

    sponsorClickStats,

    handleSponsorClick,

    recordImpression,

    ctr,

    exportSponsorReport,
  };
}
















