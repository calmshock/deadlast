# DEADLAST

## Current Status

DeadLast core gameplay is stable.

Production build passes.
Balance persistence works.
2/3/4 player modes work.
ArenaProgressContext is merged.
Working branch: next-phase.
Stable tag: arena-progress-working.

---

## Current Phase

Phase 2: Animated Arena

Goal:
Transform DeadLast from a prototype card UI into a polished cartoon arena game.

---

## Current Sprint

Sprint 001: Arena Scene V1

Goal:
Create the first playable arena environment with fixed camera, central table, neon stadium, player stations, and integrated HUD.

---

## Non-Negotiables

1. The local player is always closest to the camera.
2. The camera never rotates during gameplay.
3. The arena is the UI.
4. No card grids.
5. No scrolling gameplay area.
6. Every important action should animate.
7. Game logic and presentation stay separate.
8. Presentation never changes gameplay outcomes.

---

## Read First

1. docs/ArenaVision.md
2. docs/ArenaArtBible.md
3. docs/AnimationBible.md
4. docs/ComponentBlueprint.md
5. docs/AI/README_FOR_AI.md

---

## Active Priorities

1. Arena Scene V1
2. Player stations
3. Avatar system
4. Hand animation system
5. Cinematic reveal sequence

---

## Protected Systems

Do not modify without explicit approval:

- Game engine
- Balance persistence
- ArenaProgressContext
- Match/result calculation
- Player progression

---

## Design Direction

DeadLast should feel like:

- Mario Party
- Fall Guys
- Clash Royale
- Hearthstone polish
- Futuristic game show

DeadLast should not feel like a generic web app.

---

## Mantra

The engine decides the game.

The arena tells the story.
