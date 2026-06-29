import { Player, Placement, ResultRow, Stage } from "@/types/game";
import { resolveHeadToHead, resolveMainRound } from "./resolve";
import { buildResults } from "@/lib/payouts";
import { resolveInstantHeadToHead } from "./helpers";

type EngineResult =
  | { type: "reset" }
  | {
      type: "continue";
      nextStage: Stage;
      nextIds: string[];
      placements: Partial<Record<string, Placement>>;
    }
  | {
      type: "finished";
      placements: Partial<Record<string, Placement>>;
      results: ResultRow[];
    };

export function runMainRound(
  players: Player[],
  activeIds: string[],
  placements: Partial<Record<string, Placement>>,
  buyIn: number
): EngineResult {
  const outcome = resolveMainRound(players, activeIds);

  if (outcome.type === "reset") {
    return { type: "reset" };
  }

  if (outcome.type === "one-winner-tiebreak") {
    const winner = players.find((p) => p.id === outcome.winnerId)!;
    const losers = players.filter((p) => outcome.tiedLoserIds.includes(p.id));

    const nextPlacements = { ...placements, [winner.id]: 1 as Placement };

    if (winner.id === "user") {
      const background = resolveInstantHeadToHead(losers[0], losers[1]);

      const finalPlacements: Partial<Record<string, Placement>> = {
        [winner.id]: 1,
        [background.winner.id]: 2,
        [background.loser.id]: 3,
      };

      return {
        type: "finished",
        placements: finalPlacements,
        results: buildResults(players, finalPlacements, buyIn, 3),
      };
    }

    return {
      type: "continue",
      nextStage: "losers",
      nextIds: outcome.tiedLoserIds,
      placements: nextPlacements,
    };
  }

  const loser = players.find((p) => p.id === outcome.loserId)!;

  const nextPlacements = { ...placements, [loser.id]: 3 as Placement };

  return {
    type: "continue",
    nextStage: "winners",
    nextIds: outcome.tiedWinnerIds,
    placements: nextPlacements,
  };
}

export function runTieBreak(
  players: Player[],
  activeIds: string[],
  placements: Partial<Record<string, Placement>>,
  buyIn: number,
  stage: Stage
): EngineResult {
  const outcome = resolveHeadToHead(players, activeIds);

  if (outcome.type === "reset") {
    return { type: "reset" };
  }

  const finalPlacements = { ...placements };

  if (stage === "winners") {
    finalPlacements[outcome.winnerId] = 1;
    finalPlacements[outcome.loserId] = 2;
  } else {
    finalPlacements[outcome.winnerId] = 2;
    finalPlacements[outcome.loserId] = 3;
  }

  return {
    type: "finished",
    placements: finalPlacements,
    results: buildResults(players, finalPlacements, buyIn, 3),
  };
}