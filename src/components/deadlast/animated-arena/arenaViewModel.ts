import type { Placement, Player } from "@/types/game";
import type { ArenaPlayer } from "./types";

type BuildArenaPlayersInput = {
  players: Player[];
  activeIds: string[];
  placements: Partial<Record<string, Placement>>;
  balance?: number;
};

export function buildArenaPlayers({
  players,
  activeIds,
  placements,
  balance,
}: BuildArenaPlayersInput): ArenaPlayer[] {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    move: player.move,
    locked: player.locked,
    active: activeIds.includes(player.id),
    placement: placements[player.id],
    balance: player.isUser ? balance : undefined,
    isUser: player.isUser,
  }));
}
