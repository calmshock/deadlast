"use client";

import type { ArenaPlayer } from "./types";

type PlayerAvatarProps = {
  player: ArenaPlayer;
  active?: boolean;
};

export default function PlayerAvatar({
  player,
  active = false,
}: PlayerAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={[
          "flex h-20 w-20 items-center justify-center rounded-full",
          "border-4 text-2xl font-bold transition-all duration-300",
          active
            ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
            : "border-white/20 bg-white/10",
        ].join(" ")}
      >
        ??
      </div>

      <div className="text-center">
        <div className="font-semibold text-white">
          {player.name}
        </div>

        {player.balance !== undefined && (
          <div className="text-xs text-white/60">
            ${player.balance}
          </div>
        )}
      </div>
    </div>
  );
}
