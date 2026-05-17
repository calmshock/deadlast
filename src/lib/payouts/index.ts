import { Placement, Player, ResultRow } from "@/types/game";

export function payoutForPlacement(buyIn: number, placement: Placement): number {
  if (placement === 1) return +(buyIn * 0.6).toFixed(2);
  if (placement === 2) return +(buyIn * 0.3).toFixed(2);
  return +(-buyIn).toFixed(2);
}

export function entryRewardForPlacement(placement: Placement): number {
  return placement === 3 ? 1 : 0;
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
  buyIn: number
): ResultRow[] {
  return players
    .map((p) => {
      const placement = placements[p.id];
      if (!placement) return null;
      return {
        placement,
        name: p.name,
        delta: payoutForPlacement(buyIn, placement),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.placement - b!.placement) as ResultRow[];
}