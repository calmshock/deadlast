import { GameMode, Placement, Player, ResultRow } from "@/types/game";

export function payoutForPlacement(
  buyIn: number,
  placement: Placement,
  playerCount: GameMode,
): number {
  const loserPool = buyIn;

  const houseCut = +(loserPool * 0.1).toFixed(2);

  const distributable = +(loserPool - houseCut).toFixed(2);

  // 2 PLAYER
  // 1st gets all distributable winnings
  // 2nd loses buy-in
  if (playerCount === 2) {
    if (placement === 1) {
      return +distributable.toFixed(2);
    }

    return +(-buyIn).toFixed(2);
  }

  // 3 PLAYER
  // 1st = 66.67%
  // 2nd = 33.33%
  // 3rd loses buy-in
  if (playerCount === 3) {
    if (placement === 1) {
      return +(distributable * 0.6667).toFixed(2);
    }

    if (placement === 2) {
      return +(distributable * 0.3333).toFixed(2);
    }

    return +(-buyIn).toFixed(2);
  }

  // 4 PLAYER
  // 1st = 60%
  // 2nd = 30%
  // 3rd = 10%
  // 4th loses buy-in
  if (placement === 1) {
    return +(distributable * 0.6).toFixed(2);
  }

  if (placement === 2) {
    return +(distributable * 0.3).toFixed(2);
  }

  if (placement === 3) {
    return +(distributable * 0.1).toFixed(2);
  }

  return +(-buyIn).toFixed(2);
}

export function entryRewardForPlacement(
  placement: Placement,
  playerCount: GameMode,
): number {
  return placement === playerCount ? 1 : 0;
}

export function fmt(amount: number) {
  const sign = amount > 0 ? "+" : "";

  return `${sign}$${amount.toFixed(2)}`;
}

export function houseCutForBuyIn(buyIn: number) {
  return +(buyIn * 0.1).toFixed(2);
}

export function buildResults(
  players: Player[],
  placements: Partial<Record<string, Placement>>,
  buyIn: number,
  playerCount: GameMode,
): ResultRow[] {
  return players
    .map((p) => {
      const placement = placements[p.id];

      if (!placement) return null;

      return {
        placement,
        name: p.name,
        delta: payoutForPlacement(
          buyIn,
          placement,
          playerCount,
        ),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.placement - b!.placement) as ResultRow[];
}