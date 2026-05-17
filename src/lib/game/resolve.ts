// src/lib/game/resolve.ts

import { HeadToHeadOutcome, MainOutcome, Player } from "@/types/game";
import { getWinnerMove } from "@/lib/game/helpers";

export function resolveMainRound(players: Player[], activeIds: string[]): MainOutcome {
  const active = players.filter((p) => activeIds.includes(p.id));
  if (active.length !== 3) return { type: "reset" };

  const [a, b, c] = active;
  if (!a.move || !b.move || !c.move) return { type: "reset" };

  const moves = [a.move, b.move, c.move];
  const unique = Array.from(new Set(moves));
  if (unique.length === 1 || unique.length === 3) return { type: "reset" };

  const repeatedMove = unique.find((m) => moves.filter((x) => x === m).length === 2)!;
  const singleMove = unique.find((m) => m !== repeatedMove)!;
  const winnerMove = getWinnerMove(repeatedMove, singleMove)!;

  if (winnerMove === repeatedMove) {
    const loser = active.find((p) => p.move === singleMove)!;
    const tiedWinners = active.filter((p) => p.id !== loser.id);
    return {
      type: "two-winner-tiebreak",
      loserId: loser.id,
      tiedWinnerIds: tiedWinners.map((p) => p.id),
    };
  }

  const winner = active.find((p) => p.move === singleMove)!;
  const tiedLosers = active.filter((p) => p.id !== winner.id);
  return {
    type: "one-winner-tiebreak",
    winnerId: winner.id,
    tiedLoserIds: tiedLosers.map((p) => p.id),
  };
}

export function resolveHeadToHead(players: Player[], activeIds: string[]): HeadToHeadOutcome {
  const active = players.filter((p) => activeIds.includes(p.id));
  if (active.length !== 2) return { type: "reset" };

  const [a, b] = active;
  if (!a.move || !b.move) return { type: "reset" };
  if (a.move === b.move) return { type: "reset" };

  const winnerMove = getWinnerMove(a.move, b.move)!;
  if (winnerMove === a.move) return { type: "resolved", winnerId: a.id, loserId: b.id };
  return { type: "resolved", winnerId: b.id, loserId: a.id };
}