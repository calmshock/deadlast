# DEADLAST - Component Blueprint

## Philosophy

The game engine determines WHAT happens.

The arena determines HOW it looks.

Presentation must never contain game logic.

Game logic must never depend on presentation.

---

# Structure

Game

¦

+-- Engine
¦
+-- Arena
¦
+-- HUD
¦
+-- Effects
¦
+-- Results
¦
+-- Audio

---

# Engine

Responsibilities:

- Match state
- Countdown
- Winner calculation
- Eliminations
- Balance
- Entries
- Progress
- Bots

Engine NEVER imports UI.

---

# Arena

Responsibilities:

- Background
- Table
- Chairs
- Player positioning
- Camera
- Avatar rendering

Arena NEVER calculates winners.

---

# Player Seat

Owns:

- Avatar
- Name
- Pedestal
- Hand
- Reactions

Never knows game rules.

---

# Avatar

Owns:

- Idle animation
- Blink
- Emotes
- Celebration
- Defeat

Never owns game state.

---

# Hand

Owns:

- Rock animation
- Paper animation
- Scissors animation
- Reveal animation

Never knows who won.

---

# HUD

Owns:

- Balance
- Entries
- Timer
- Round
- Settings

Never owns gameplay.

---

# Effects

Owns:

- Particles
- Confetti
- Smoke
- Lighting
- Camera shake

Pure presentation.

---

# Results

Owns:

- Winner screen
- Entry rewards
- Play Again
- Exit

No gameplay calculations.

---

# Audio

Owns:

- Music
- Crowd
- Voice lines
- Sound effects

Never affects gameplay.

---

# Golden Rule

Game Engine

?

Arena

?

Effects

?

Audio

Information flows one direction only.

Never backwards.
