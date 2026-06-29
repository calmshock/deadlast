# Deadlast Arena Architecture Audit

## Executive Summary

The current architecture has **significant state fragmentation** across two hooks (`useDeadlastGame` and `useArena`) with **47+ state declarations** in the main game hook alone. This creates multiple sources of truth for the same logical data, making it difficult to reason about state flow and introducing potential consistency issues.

## Current Architecture Overview

### State Management Layers

**Layer 1: `useDeadlastGame` (Main Game Hook)**
- **1,116 lines** of code
- **47+ useState/useRef/useMemo** declarations
- Manages: game phase, players, placements, results, entries, balance, UI state, timers
- Handles: game logic, player moves, round resolution, entry awards

**Layer 2: `useArena` (Arena Mode Hook)**
- Separate from main game hook
- Manages: bot players, matchmaking queue, match history
- Handles: arena-specific progression and statistics

**Layer 3: `ArenaProgress` (localStorage persistence)**
- Stores: session/lifetime loss entries, eligible losses, auto-losses, arena credits
- Read/write functions scattered across components

### Data Flow

```
useDeadlastGame
├── Game Phase (lobby → countdown → locked → revealing → results)
├── Players (user + bots)
├── Placements (1st, 2nd, 3rd, 4th)
├── Results (ResultRow[])
├── Entries (sessionLossEntries, lifetimeLossEntries)
├── Balance (buy-in amount)
├── UI State (modals, toasts, timers)
└── Progress (synced from localStorage via readArenaProgress)

ArenaProgress (localStorage)
├── sessionLossEntries
├── lifetimeLossEntries
├── sessionEligibleLosses
├── lifetimeEligibleLosses
├── sessionIneligibleAutoLosses
├── lifetimeIneligibleAutoLosses
└── arenaCredits
```

## Identified Issues

### 1. **Duplicated State: Entries**

**Problem:** Entry data exists in THREE places:
- `useDeadlastGame`: `entries`, `lifetimeEntries`, `entriesEarnedThisMatch`
- `ArenaProgress` (localStorage): `sessionLossEntries`, `lifetimeLossEntries`
- Components read from hook, but updates go through `writeArenaProgress()`

**Evidence:**
```typescript
// useDeadlastGame.ts line 167-168
const [entries, setEntries] = useState(0);
const [lifetimeEntries, setLifetimeEntries] = useState(0);

// useDeadlastGame.ts line 245-250
function syncEntriesFromProgress() {
  const progress = readArenaProgress();
  setEntries(progress.sessionLossEntries);
  setLifetimeEntries(progress.lifetimeLossEntries);
}
```

**Impact:**
- Manual sync required after every progress update
- Risk of stale state if sync is missed
- Two different naming conventions (entries vs lossEntries)

### 2. **Derived State Not Memoized**

**Problem:** Computed values recalculated on every render:
```typescript
// useDeadlastGame.ts line 230-232
const houseCut = useMemo(() => {
  return +(buyIn * 0.1).toFixed(2);
}, [buyIn]);

// useDeadlastGame.ts line 237-243
const ctr = useMemo(() => {
  if (sponsorClickStats.totalImpressions === 0) return 0;
  return (sponsorClickStats.totalClicks / sponsorClickStats.totalImpressions) * 100;
}, [sponsorClickStats]);
```

**Issue:** Some derived values are memoized, but many aren't. No consistent pattern.

### 3. **Scattered Progress Updates**

**Problem:** `ArenaProgress` updates happen in multiple places:
- `useDeadlastGame` calls `writeArenaProgress()` after match resolution
- `useArena` calls `writeArenaProgress()` for arena-specific progress
- No centralized update function

**Impact:**
- Difficult to track when/why progress changes
- Easy to miss updates when adding features
- No audit trail

### 4. **Mixed Concerns in useDeadlastGame**

The hook handles:
- Game loop logic (countdown, reveal, resolve)
- UI state (modals, toasts, timers)
- Player management (creation, moves, placements)
- Entry/progress tracking
- Auto-play logic
- Sponsor tracking
- Daily draw logic

**Issue:** 1,116 lines trying to do too much. Hard to test, maintain, and reason about.

### 5. **Ref-Based Hidden State**

```typescript
// useDeadlastGame.ts line 213-218
const currentPlacesRef = useRef<Placement[]>([1, 2, 3]);
const hiddenPlacementsRef = useRef<Partial<Record<string, Placement>>>({});
const userMadeManualPickThisMatchRef = useRef(false);
const userWasAutoPickedThisMatchRef = useRef(false);
const awardedEntryRef = useRef(false);
const resolvingRef = useRef(false);
```

**Problem:** Critical game state stored in refs instead of state:
- Not part of render cycle
- Difficult to debug
- Refs don't trigger re-renders when updated
- Inconsistent with rest of state management

### 6. **No Clear Ownership of Arena State**

**Question:** Does `useDeadlastGame` or `useArena` own:
- Player list?
- Match results?
- Player progression?

**Answer:** Unclear. Both hooks seem to manage similar concepts.

## Proposed Refactoring Strategy

### Phase 1: Consolidate Entry State

**Goal:** Single source of truth for all entry/progress data

**Changes:**
1. Create `ArenaProgressContext` to provide progress state to entire app
2. Move all entry-related state to context
3. Update `useDeadlastGame` to read from context instead of managing entries
4. Eliminate manual sync calls

**Benefits:**
- Automatic updates across all components
- Single naming convention
- Easier to test progress logic

### Phase 2: Extract Game Logic

**Goal:** Separate game loop from UI state

**Changes:**
1. Create `useGameLoop` hook for phase transitions and timing
2. Create `usePlayerState` hook for player management
3. Create `useMatchResolution` hook for round resolution
4. Keep `useDeadlastGame` as orchestrator

**Benefits:**
- Each hook has single responsibility
- Easier to test logic in isolation
- Clearer data flow

### Phase 3: Eliminate Ref-Based State

**Goal:** Move critical state from refs to useState

**Changes:**
1. Move `currentPlacesRef`, `hiddenPlacementsRef`, etc. to state
2. Create `useMatchState` hook to manage match-specific state
3. Update resolution logic to use state instead of refs

**Benefits:**
- Proper React lifecycle
- Easier debugging
- Consistent with rest of app

### Phase 4: Unify Arena State

**Goal:** Clear ownership of arena-specific state

**Changes:**
1. Determine if `useArena` is needed for main game mode
2. If yes: extract arena-specific logic into separate hook
3. If no: merge into `useDeadlastGame` with clear sections

**Benefits:**
- No duplicate player/match management
- Clear scope boundaries

## Refactoring Priority

**High Priority (Blocks 3D Integration):**
1. Consolidate entry state (Phase 1)
2. Extract match resolution logic (Phase 2)
3. Eliminate ref-based state (Phase 3)

**Medium Priority (Improves Maintainability):**
4. Extract game loop logic (Phase 2)
5. Extract player state (Phase 2)
6. Unify arena state (Phase 4)

**Low Priority (Nice to Have):**
7. Add comprehensive tests
8. Add error boundaries
9. Add performance monitoring

## Impact on 3D Integration

**Current State:** Difficult to integrate 3D arena because:
- Unclear where to hook in for animation triggers
- State scattered across multiple sources
- Difficult to pass correct props to 3D component

**After Refactoring:** Easy to integrate because:
- Clear state ownership
- Single source of truth for player/match data
- Easy to subscribe to state changes for animations

## Implementation Notes

- **Preserve existing APIs:** Component interfaces should remain unchanged
- **Backward compatible:** Game logic should produce identical results
- **Incremental:** Refactor one section at a time, test thoroughly
- **No rewrites:** Use existing logic, just reorganize

## Files to Modify

**Core:**
- `src/hooks/useDeadlastGame.ts` (refactor into multiple hooks)
- `src/lib/arena/progress.ts` (create context wrapper)

**New Files:**
- `src/contexts/ArenaProgressContext.tsx`
- `src/hooks/useGameLoop.ts`
- `src/hooks/useMatchState.ts`
- `src/hooks/useMatchResolution.ts`

**Components (minimal changes):**
- `src/app/arena/page.tsx` (use context instead of hook)
- `src/components/deadlast/ArenaStage.tsx` (no changes needed)

## Success Criteria

1. ✅ Single source of truth for entries/progress
2. ✅ All state in useState (no hidden refs)
3. ✅ Game logic unchanged (same match results)
4. ✅ Component interfaces unchanged
5. ✅ Easy to integrate 3D arena visuals
6. ✅ Reduced hook complexity (< 500 lines per hook)
