import Link from "next/link";
import { BUY_INS } from "@/types/game"
import type { GameMode, Phase } from "@/types/game"

type HeroPanelProps = {
  buyIn: number
  houseCut: number
  phase: Phase

  playerCount: GameMode
  setPlayerCount: (value: GameMode) => void

  autoPlayEnabled: boolean
  autoPlayDelay: number

  setBuyIn: (value: number) => void
  startMatch: () => void
  ctaLabel?: string
  ctaHref?: string

  setAutoPlayEnabled: (value: boolean) => void
  setAutoPlayDelay: (value: number) => void
}

const PLAYER_OPTIONS: GameMode[] = [2, 3, 4]

export default function HeroPanel({
  buyIn,
  houseCut,
  phase,

  playerCount,
  setPlayerCount,

  autoPlayEnabled,
  autoPlayDelay,

  setBuyIn,
  startMatch,
  ctaLabel,
  ctaHref,

  setAutoPlayEnabled,
  setAutoPlayDelay,
}: HeroPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(255,255,255,0.03)]">
      <div className="mb-3 text-sm uppercase tracking-[0.25em] text-red-300/70">
        Play fast. Avoid last.
      </div>

      <h2 className="mb-3 text-4xl font-black uppercase leading-none sm:text-5xl">
        Only one player loses.
      </h2>

      <p className="max-w-2xl text-base text-white/70 sm:text-lg">
        2–4 players enter. Full ties replay automatically. Tied winners trigger
        a winners round. Tied losers trigger a losers round. This is a
        play-money prototype.
      </p>

      <div className="mt-6">
        <div className="mb-3 text-xs uppercase tracking-[0.25em] text-white/40">
          Players
        </div>

        <div className="flex flex-wrap gap-3">
          {PLAYER_OPTIONS.map((value) => (
            <button
              key={value}
              onClick={() => setPlayerCount(value)}
              disabled={phase !== "lobby" && phase !== "results"}
              className={`rounded-2xl border px-5 py-3 text-sm font-bold transition ${
                playerCount === value
                  ? "border-fuchsia-300 bg-fuchsia-400/15 text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.25)]"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {value}P
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-xs uppercase tracking-[0.25em] text-white/40">
          Buy-in
        </div>

        <div className="flex flex-wrap gap-3">
          {BUY_INS.map((value) => (
            <button
              key={value}
              onClick={() => setBuyIn(value)}
              className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                buyIn === value
                  ? "border-cyan-300 bg-cyan-400/15 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {ctaHref ? (
          <Link
            href={ctaHref}
            onClick={() => {
              window.localStorage.setItem("deadlast:lobby:playerCount", String(playerCount));
              window.localStorage.setItem("deadlast:lobby:buyIn", String(buyIn));
              window.localStorage.setItem("deadlast:lobby:autoPlayEnabled", String(autoPlayEnabled));
              window.localStorage.setItem("deadlast:lobby:autoPlayDelay", String(autoPlayDelay));
            }}
            className="rounded-2xl bg-red-500 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(239,68,68,0.35)] transition hover:scale-[1.02] hover:bg-red-400"
          >
            {ctaLabel ?? "Enter Arena"}
          </Link>
        ) : (
          <button
            onClick={startMatch}
            className="rounded-2xl bg-red-500 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(239,68,68,0.35)] transition hover:scale-[1.02] hover:bg-red-400"
          >
            {ctaLabel ?? (phase === "lobby" ? "Play Now" : "New Match")}
          </button>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
          <span>
            Players:{" "}
            <span className="font-bold text-white">
              {playerCount}
            </span>
          </span>

          <span className="mx-2 text-white/20">•</span>

          <span>
            Buy-in:{" "}
            <span className="font-bold text-white">
              ${buyIn}
            </span>
          </span>

          <span className="mx-2 text-white/20">•</span>

          <span>
            House cut:{" "}
            <span className="font-bold text-white">
              ${houseCut.toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={autoPlayEnabled}
              onChange={(e) =>
                setAutoPlayEnabled(e.target.checked)
              }
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />

            <span>
              Autoplay following matches until turned off
            </span>
          </label>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>Delay</span>

            <select
              value={String(autoPlayDelay)}
              onChange={(e) =>
                setAutoPlayDelay(Number(e.target.value))
              }
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              <option value="1500">1.5s</option>
              <option value="3000">3s</option>
              <option value="5000">5s</option>
              <option value="8000">8s</option>
            </select>
          </div>
        </div>

        <div className="mt-2 text-xs text-white/45">
          Control autoplay here or from the completed outcome popup.
        </div>
      </div>
    </div>
  )
}


