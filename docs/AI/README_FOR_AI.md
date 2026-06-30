\# DEADLAST – AI Development Guide



\## Welcome



You are contributing to \*\*DeadLast\*\*, a competitive multiplayer party game.



Before writing code, you MUST understand the project philosophy.



This repository is organized to keep gameplay systems independent from presentation.



\---



\# Required Reading



Read these documents in order:



1\. `/DEADLAST.md`

2\. `/docs/ArenaVision.md`

3\. `/docs/ArenaArtBible.md`

4\. `/docs/AnimationBible.md`

5\. `/docs/ComponentBlueprint.md`

6\. `/docs/GDD/`



Do not begin implementation until these have been reviewed.



\---



\# Project Philosophy



DeadLast is \*\*not\*\* a Rock Paper Scissors simulator.



DeadLast is a \*\*party arena game\*\* where Rock Paper Scissors is the core mechanic.



The game should feel closer to a Nintendo party game than a traditional web application.



\---



\# Architecture Rules



The engine decides the game.



The arena tells the story.



Presentation must never contain gameplay logic.



Gameplay must never depend on presentation.



Information flows in one direction only.



\---



\# Protected Systems



Do not modify without explicit approval:



\* Match engine

\* Balance persistence

\* ArenaProgressContext

\* Player progression

\* Result calculation



\---



\# Visual Identity



The approved visual style is defined in:



\* Arena Art Bible

\* Arena Vision

\* Concept artwork



Do not invent a new visual language.



Maintain consistency.



\---



\# Coding Standards



\* TypeScript only

\* Functional React components

\* Reusable components

\* Small focused files

\* Strong typing

\* Responsive layouts

\* No duplicated logic

\* No inline magic numbers



Every commit must maintain a successful production build.



\---



\# Design Principles



\* The player is always closest to the camera.

\* The camera never rotates during gameplay.

\* The arena is the UI.

\* No scrolling gameplay screens.

\* Every meaningful action should animate.

\* Fast rounds.

\* Strong anticipation.

\* Memorable reveals.



\---



\# Workflow



Design



↓



Approval



↓



Implementation



↓



Review



↓



Merge



Never skip design.



\---



\# Current Priority



Build the animated arena while preserving the existing gameplay engine.



The current engine is considered stable.



The presentation layer is under active development.



\---



\# Definition of Done



A feature is complete only if:



\* Production build passes

\* Existing gameplay still works

\* Matches the Art Bible

\* Matches the Animation Bible

\* Is reusable

\* Is reviewed before merge



