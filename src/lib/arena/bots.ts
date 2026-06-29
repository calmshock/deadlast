import type { ArenaPick, ArenaPlayer } from "@/types/arena"

const BOT_NAMES = [
  "Rogue Moose",
  "Lucky Tuna",
  "Turbo Cactus",
  "Neon Wolf",
  "Steel Mango",
  "Quiet Cobra",
  "Dusty Falcon",
  "Blue Rhino",
  "Rapid Otter",
  "Velvet Shark",
  "Ghost Pepper",
  "Crimson Yak",
  "Solar Fox",
  "Night Owl",
  "Silver Pike",
  "Nova Bear",
  "Static Lynx",
  "Wild Comet",
  "Pixel Viper",
  "Storm Hare",
]

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function randomPick(): ArenaPick {
  return randomItem(["rock", "paper", "scissors"])
}

export function createBot(index?: number): ArenaPlayer {
  const now = Date.now()
  const suffix = Math.floor(Math.random() * 900 + 100)
  const nameBase = BOT_NAMES[(index ?? Math.floor(Math.random() * BOT_NAMES.length)) % BOT_NAMES.length]

  return {
    id: `bot-${now}-${Math.random().toString(36).slice(2, 9)}`,
    name: `${nameBase} ${suffix}`,
    isBot: true,
    auto: true,
    preferredPick: null,
    joinedAt: now,
    lastActiveAt: now,
    gamesPlayed: 0,
    wins: 0,
    seconds: 0,
    thirds: 0,
    fourths: 0,
  }
}

export function getPlayerPick(player: ArenaPlayer): ArenaPick {
  if (!player.auto && player.preferredPick) {
    return player.preferredPick
  }

  if (player.preferredPick && Math.random() < 0.7) {
    return player.preferredPick
  }

  return randomPick()
}