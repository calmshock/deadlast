"use client"

import { useMemo } from "react"
import { useArena } from "@/hooks/useArena"
import type { ArenaPick } from "@/types/arena"

function pickLabel(pick: ArenaPick) {
  if (pick === "rock") return "Rock"
  if (pick === "paper") return "Paper"
  return "Scissors"
}

export default function ArenaPage() {
  const {
    user,
    userProgress,
    queuePlayers,
    currentMatch,
    recentLogs,
    latestResult,
    leaderboard,
    stats,
    isUserQueued,
    totalPlacedMatches,
    derivedSessionLossEntries,
    derivedSessionEligibleLosses,
    derivedSessionAutoLosses,
    joinArena,
    leaveArena,
    setPreferredPick,
    toggleAuto,
    addArenaCredits,
    resetSessionProgress,
    resetAllProgress,
  } = useArena()

  const queuePreview = useMemo(() => queuePlayers.slice(0, 8), [queuePlayers])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Deadlast
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">Arena Phase</h1>
              <p className="max-w-2xl text-sm text-neutral-300 md:text-base">
                Fake-live matchmaking loop with bots, rolling matches, standings, session tracking, lifetime tracking, and arena credits.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Players in queue" value={String(queuePlayers.length)} />
              <StatCard label="Total matches" value={String(stats.totalMatches)} />
              <StatCard label="Bots created" value={String(stats.totalBotsCreated)} />
              <StatCard label="Arena credits" value={String(userProgress.arenaCredits)} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Your Arena Seat</h2>
                  <p className="text-sm text-neutral-400">
                    Session placings reset when the arena session resets. Lifetime counters persist.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!isUserQueued ? (
                    <button
                      onClick={joinArena}
                      className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                    >
                      Join Arena
                    </button>
                  ) : (
                    <button
                      onClick={leaveArena}
                      className="rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/30"
                    >
                      Leave Arena
                    </button>
                  )}

                  <button
                    onClick={toggleAuto}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    Auto: {user?.auto ? "On" : "Off"}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["rock", "paper", "scissors"] as ArenaPick[]).map((pick) => {
                    const active = user?.preferredPick === pick

                    return (
                      <button
                        key={pick}
                        onClick={() => setPreferredPick(pick)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-cyan-400/50 bg-cyan-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-sm text-neutral-400">Preferred pick</div>
                        <div className="mt-1 text-lg font-semibold">{pickLabel(pick)}</div>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm text-neutral-400">Status</div>
                  <div className="mt-1 text-lg font-semibold">
                    {isUserQueued ? "Queued" : "Spectating"}
                  </div>
                  <div className="mt-2 text-sm text-neutral-300">
                    Preferred: {user?.preferredPick ? pickLabel(user.preferredPick) : "None"}
                  </div>
                  <div className="text-sm text-neutral-300">
                    Placings (1st / 2nd / 3rd): {user?.wins ?? 0} / {user?.seconds ?? 0} / {user?.thirds ?? 0}
                  </div>
                  <div className="text-sm text-neutral-300">
                    Total placed matches: {totalPlacedMatches}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Entries & Credits</h2>
                  <p className="text-sm text-neutral-400">
                    Session loss entries are derived from current placings and only count manual 3rd-place finishes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => addArenaCredits(100)}
                    className="rounded-2xl border border-amber-400/30 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/25"
                  >
                    Test +100 Credits
                  </button>
                  <button
                    onClick={resetSessionProgress}
                    className="rounded-2xl border border-sky-400/30 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/25"
                  >
                    Reset Session
                  </button>
                  <button
                    onClick={resetAllProgress}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStatCard
                  label="Session loss entries"
                  value={String(derivedSessionLossEntries)}
                />
                <MiniStatCard
                  label="Lifetime loss entries"
                  value={String(userProgress.lifetimeLossEntries)}
                />
                <MiniStatCard
                  label="Session eligible losses"
                  value={String(derivedSessionEligibleLosses)}
                />
                <MiniStatCard
                  label="Lifetime eligible losses"
                  value={String(userProgress.lifetimeEligibleLosses)}
                />
                <MiniStatCard
                  label="Session auto losses"
                  value={String(derivedSessionAutoLosses)}
                />
                <MiniStatCard
                  label="Lifetime auto losses"
                  value={String(userProgress.lifetimeIneligibleAutoLosses)}
                />
                <MiniStatCard
                  label="Arena credits"
                  value={String(userProgress.arenaCredits)}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                Manual 3rd place with Auto Off = <span className="font-semibold text-white">+1 entry</span>.{" "}
                1st and 2nd place = <span className="font-semibold text-white">0 entries</span>.{" "}
                Auto 3rd place = <span className="font-semibold text-white">0 entries</span>, but it still increases the auto-loss counters.
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Current Match</h2>
                  <p className="text-sm text-neutral-400">
                    Live card for the latest arena matchup.
                  </p>
                </div>
              </div>

              {!currentMatch ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-400">
                  Waiting for next match...
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm text-neutral-400">Match status</div>
                    <div className="mt-1 text-lg font-semibold capitalize">{currentMatch.status}</div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {currentMatch.players.map((player) => {
                      const placement =
                        latestResult?.placements?.[player.id] !== undefined
                          ? latestResult.placements[player.id]
                          : null

                      return (
                        <div
                          key={player.id}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-lg font-semibold">{player.name}</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                              {player.isBot ? "Bot" : "You"}
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-neutral-300">
                            Games: {player.gamesPlayed}
                          </div>

                          {placement ? (
                            <div className="mt-2 text-sm font-semibold text-cyan-200">
                              Place: {placement}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>

                  {latestResult ? (
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                      <div className="text-sm text-cyan-200">Latest result</div>
                      <div className="mt-1 text-lg font-semibold">{latestResult.subtitle}</div>
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Round Log</h2>
                  <p className="text-sm text-neutral-400">
                    Latest match resolution log.
                  </p>
                </div>
              </div>

              <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {recentLogs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-400">
                    No logs yet.
                  </div>
                ) : (
                  recentLogs.map((log, index) => (
                    <div
                      key={`${log.id}-${index}`}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="text-sm font-semibold">{log.title}</div>
                      <div className="mt-1 text-sm text-neutral-300">{log.detail}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div>
                <h2 className="text-xl font-semibold">Queue Preview</h2>
                <p className="text-sm text-neutral-400">
                  First players waiting for the next pull.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {queuePreview.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">
                        #{index + 1} {player.name}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {player.isBot ? "Bot" : "You"}
                      </div>
                    </div>

                    <div className="text-sm text-neutral-300">
                      {player.auto
                        ? "Auto"
                        : player.preferredPick
                        ? pickLabel(player.preferredPick)
                        : "Manual"}
                    </div>
                  </div>
                ))}

                {queuePreview.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-400">
                    Queue is empty.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div>
                <h2 className="text-xl font-semibold">Leaderboard</h2>
                <p className="text-sm text-neutral-400">
                  Top records across the current arena session.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">
                        #{index + 1} {player.name}
                      </div>
                      <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                        {player.isBot ? "Bot" : "You"}
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-neutral-300">
                      <div>1st: {player.wins}</div>
                      <div>2nd: {player.seconds}</div>
                      <div>3rd: {player.thirds}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  )
}