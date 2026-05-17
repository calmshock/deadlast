import { Phase, Placement, Player, ResultRow } from "@/types/game";
import PlayerCard from "./PlayerCard";
import type { ArenaPick } from "@/types/arena";

type PlayersSectionProps = {
  players: Player[];
  phase: Phase;
  activeIds: string[];
  placements: Partial<Record<string, Placement>>;
  results: ResultRow[];
  userCycleEntries?: number;
  userLifetimeEntries?: number;
  entriesAwardEligible?: boolean;
  entriesEarnedThisMatch?: number;
  arenaAutoEnabled?: boolean;
  arenaGamesPlayed?: number;
  arenaWins?: number;
  arenaSeconds?: number;
  arenaThirds?: number;
  arenaPreferredPick?: ArenaPick | null;
};

export default function PlayersSection({
  players,
  phase,
  activeIds,
  placements,
  results,
  userCycleEntries = 0,
  userLifetimeEntries = 0,
  entriesAwardEligible = false,
  entriesEarnedThisMatch = 0,
  arenaAutoEnabled = false,
  arenaGamesPlayed = 0,
  arenaWins = 0,
  arenaSeconds = 0,
  arenaThirds = 0,
  arenaPreferredPick = null,
}: PlayersSectionProps) {
  return (
    <section className="mb-6 grid gap-4 md:grid-cols-3">
      {players.map((player) => {
        const placement = placements[player.id];
        const result = results.find((r) => r.name === player.name);
        const isActiveInCurrentRound = activeIds.includes(player.id);

        return (
          <PlayerCard
            key={player.id}
            player={player}
            phase={phase}
            placement={placement}
            result={result}
            isActiveInCurrentRound={isActiveInCurrentRound}
            cycleEntries={player.isUser ? userCycleEntries : undefined}
            lifetimeEntries={player.isUser ? userLifetimeEntries : undefined}
            entriesAwardEligible={player.isUser ? entriesAwardEligible : undefined}
            entriesEarnedThisMatch={player.isUser ? entriesEarnedThisMatch : undefined}
            arenaAutoEnabled={player.isUser ? arenaAutoEnabled : undefined}
            arenaGamesPlayed={player.isUser ? arenaGamesPlayed : undefined}
            arenaWins={player.isUser ? arenaWins : undefined}
            arenaSeconds={player.isUser ? arenaSeconds : undefined}
            arenaThirds={player.isUser ? arenaThirds : undefined}
            arenaPreferredPick={player.isUser ? arenaPreferredPick : undefined}
          />
        );
      })}
    </section>
  );
}