// src/lib/game/helpers.ts

import {
  BOT_NAMES,
  FinishContext,
  InstantHeadToHeadResult,
  ModalMeta,
  MOVE_LABELS,
  Move,
  MoveStats,
  Placement,
  Player,
  ResultRow,
  RoundLogEntry,
  Stage,
} from "@/types/game";

export function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomMove(): Move {
  return randomFrom(["rock", "paper", "scissors"] as const);
}

export function getWinnerMove(a: Move, b: Move): Move | null {
  if (a === b) return null;
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  ) {
    return a;
  }
  return b;
}

export function makePlayers(): Player[] {
  const names = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  return [
    { id: "user", name: "You", isUser: true, move: null, locked: false },
    { id: "bot-1", name: names[0], isUser: false, move: null, locked: false },
    { id: "bot-2", name: names[1], isUser: false, move: null, locked: false },
  ];
}

export function makeLogId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function roundHeading(stage: Stage, tie: boolean) {
  if (stage === "main") return tie ? "3-way tie" : "Main round";
  if (stage === "winners") return tie ? "Tied round" : "Playing for 1st/2nd";
  return tie ? "Tied round" : "Playing for 2nd/3rd";
}

export function roundSubheading(stage: Stage, tie: boolean) {
  if (stage === "main") return tie ? "No clear winner. Replaying all 3 players." : "Choose your move.";
  if (stage === "winners") return tie ? "Still playing for 1st/2nd." : "One player already locked 3rd.";
  return tie ? "Still playing for 2nd/3rd." : "One player already locked 1st.";
}

export function resolveInstantHeadToHead(
  p1: Player,
  p2: Player
): InstantHeadToHeadResult {
  const attempts: Array<{ name: string; move: Move }[]> = [];

  for (let i = 0; i < 50; i += 1) {
    const m1 = randomMove();
    const m2 = randomMove();
    attempts.push([
      { name: p1.name, move: m1 },
      { name: p2.name, move: m2 },
    ]);

    const winnerMove = getWinnerMove(m1, m2);
    if (!winnerMove) continue;
    if (winnerMove === m1) return { winner: p1, loser: p2, attempts };
    return { winner: p2, loser: p1, attempts };
  }

  return { winner: p1, loser: p2, attempts };
}

export function clearPlayersForRound(current: Player[], ids: string[]) {
  return current.map((p) => {
    if (ids.includes(p.id)) return { ...p, move: null, locked: false };
    if (p.isUser) return { ...p, move: null, locked: false };
    return p;
  });
}

export function loserCopy(results: ResultRow[]) {
  const you = results.find((r) => r.name === "You");
  if (!you) return "Fresh table. Fast reset. Run it back.";
  return "Dead last this time, but the reset is instant and the whole ladder flips on one clean read.";
}

export function emptyStats(): MoveStats {
  return { rock: 0, paper: 0, scissors: 0 };
}

export function recordMoveStats(
  current: Record<string, MoveStats>,
  picks: { name: string; move: Move | null }[]
) {
  const next = { ...current };

  for (const pick of picks) {
    if (!pick.move) continue;
    if (!next[pick.name]) next[pick.name] = emptyStats();
    next[pick.name] = {
      ...next[pick.name],
      [pick.move]: next[pick.name][pick.move] + 1,
    };
  }

  return next;
}

export function topMoveLabel(stats?: MoveStats) {
  if (!stats) return "No read yet";
  const total = stats.rock + stats.paper + stats.scissors;
  if (total === 0) return "No read yet";

  const entries: Array<[Move, number]> = [
    ["rock", stats.rock],
    ["paper", stats.paper],
    ["scissors", stats.scissors],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const [move, count] = entries[0];
  const pct = Math.round((count / total) * 100);
  return `${MOVE_LABELS[move]} ${pct}%`;
}

export function modalMeta(context: FinishContext): ModalMeta {
  switch (context) {
    case "main_round_win":
      return {
        badge: "Main round win",
        title: "YOU WON!!",
        body: "You locked 1st in the main round. The remaining places were settled in the background.",
        panelClass: "border-lime-300/20 bg-[#11131b]",
        badgeClass: "text-lime-200/70",
        titleClass: "text-lime-300",
      };
    case "final_first":
      return {
        badge: "Completed outcome",
        title: "YOU WON!!",
        body: "You closed the decider and took 1st. Clean finish.",
        panelClass: "border-lime-300/20 bg-[#11131b]",
        badgeClass: "text-lime-200/70",
        titleClass: "text-lime-300",
      };
    case "final_second":
      return {
        badge: "Completed outcome",
        title: "YOU WON!!",
        body: "You finished in the money. Nice recovery. One cleaner read and that flips to 1st next round.",
        panelClass: "border-cyan-300/20 bg-[#0f1520]",
        badgeClass: "text-cyan-200/70",
        titleClass: "text-cyan-300",
      };
    case "final_third":
    default:
      return {
        badge: "Completed outcome",
        title: "Run it back",
        body: "Fast reset, fresh table, new chance. One clean throw flips the whole board.",
        panelClass: "border-red-300/20 bg-[#161015]",
        badgeClass: "text-red-200/70",
        titleClass: "text-red-300",
      };
  }
}