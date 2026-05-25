export type DrawEntry = {
  id: string;
  playerName: string;
};

export type RankedDrawWinner = {
  rank: number;
  playerName: string;
  prize: number;
  entryId: string;
};

export const DAILY_DRAW_TOTAL_PRIZE = 1000;

export const DAILY_DRAW_PRIZES = [350, 200, 120, 80, 60, 50, 45, 40, 30, 25];

export function buildDrawEntries(playerName: string, entryCount: number): DrawEntry[] {
  return Array.from({ length: Math.max(0, entryCount) }, (_, index) => ({
    id: `${playerName}-${Date.now()}-${index}`,
    playerName,
  }));
}

export function runRankedDailyDraw(entries: DrawEntry[]): RankedDrawWinner[] {
  const available = [...entries];
  const winners: RankedDrawWinner[] = [];
  const alreadyWon = new Set<string>();

  for (let rank = 1; rank <= DAILY_DRAW_PRIZES.length; rank++) {
    const eligible = available.filter((entry) => !alreadyWon.has(entry.playerName));
    if (eligible.length === 0) break;

    const selected = eligible[Math.floor(Math.random() * eligible.length)];

    winners.push({
      rank,
      playerName: selected.playerName,
      prize: DAILY_DRAW_PRIZES[rank - 1],
      entryId: selected.id,
    });

    alreadyWon.add(selected.playerName);
  }

  return winners;
}

export function formatPrize(amount: number) {
  return `$${amount.toFixed(2)}`;
}
