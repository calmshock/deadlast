"use client";

/**
 * ArenaHand — PRESENTATION ONLY
 *
 * Renders the correct hand graphic for a given move using the existing
 * Rock/Paper/Scissors SVGs. When the move is hidden (pre-reveal) it shows a
 * neutral "ready" silhouette. No gameplay logic lives here — it only maps a
 * move + visibility flag to a visual.
 */

import type { Move } from "@/types/game";
import RockHand from "../hands/RockHand";
import PaperHand from "../hands/PaperHand";
import ScissorsHand from "../hands/ScissorsHand";

type ArenaHandProps = {
  move: Move | null;
  /** When false, the move is concealed (pre-reveal) and a neutral fist shows. */
  revealed: boolean;
  className?: string;
};

export default function ArenaHand({ move, revealed, className = "" }: ArenaHandProps) {
  if (!revealed || !move) {
    // Concealed pre-reveal state: a neutral closed hand keeps picks hidden.
    return <RockHand className={`${className} opacity-70`} />;
  }

  if (move === "rock") return <RockHand className={className} />;
  if (move === "paper") return <PaperHand className={className} />;
  return <ScissorsHand className={className} />;
}
