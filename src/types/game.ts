// src/types/game.ts

export type Move = "rock" | "paper" | "scissors";
export type GameMode = 2 | 3 | 4;
export type Phase = "lobby" | "countdown" | "locked" | "revealing" | "results";
export type Stage = "main" | "winners" | "losers";
export type Placement = 1 | 2 | 3 | 4;
export type FinishContext =
  | "main_round_win"
  | "final_first"
  | "final_second"
  | "final_third";

export type Player = {
  id: string;
  name: string;
  isUser: boolean;
  move: Move | null;
  locked: boolean;
};

export type ResultRow = {
  placement: Placement;
  name: string;
  delta: number;
};

export type RoundLogEntry = {
  id: string;
  title: string;
  subtitle: string;
  picks: { name: string; move: Move | null }[];
  outcome: string;
};

export type MoveStats = {
  rock: number;
  paper: number;
  scissors: number;
};

export type MainOutcome =
  | { type: "reset" }
  | { type: "one-winner-tiebreak"; winnerId: string; tiedLoserIds: string[] }
  | { type: "two-winner-tiebreak"; loserId: string; tiedWinnerIds: string[] };

export type HeadToHeadOutcome =
  | { type: "reset" }
  | { type: "resolved"; winnerId: string; loserId: string };

export type InstantHeadToHeadAttempt = { name: string; move: Move }[];

export type InstantHeadToHeadResult = {
  winner: Player;
  loser: Player;
  attempts: InstantHeadToHeadAttempt[];
};

export type ModalMeta = {
  badge: string;
  title: string;
  body: string;
  panelClass: string;
  badgeClass: string;
  titleClass: string;
};

export const BUY_INS = [1, 2, 5, 10, 50, 100] as const;

export const BOT_NAMES = ["Vex", "Riot", "Knox", "Shade", "Mako", "Hex"] as const;

export const ROUND_SECONDS = 8;

export const MOVE_LABELS: Record<Move, string> = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};