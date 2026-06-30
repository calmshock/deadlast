export type ArenaPlayer = {
  id: string;
  name: string;
  balance?: number;
  isBot?: boolean;
};

export type ArenaChoice = "rock" | "paper" | "scissors";

export type ArenaSeatPosition = {
  x: string;
  y: string;
};

export type ArenaPhase =
  | "waiting"
  | "countdown"
  | "choosing"
  | "lockedIn"
  | "revealing"
  | "reacting"
  | "results";
