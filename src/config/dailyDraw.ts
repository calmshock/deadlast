// src/config/dailyDraw.ts

export type SponsorSlot = {
  name: string;
  tagline: string;
  cta: string;
  href: string;
  logo: string; // 👈 NEW
};

export const DAILY_DRAW_PRIZE = "$50 Cash";

export const DAILY_DRAW_SPONSOR: SponsorSlot = {
  name: "Sponsor Slot",
  tagline: "Your brand could own the daily draw.",
  cta: "Become a Sponsor",
  href: "https://example.com",
  logo: "/sponsor-placeholder.png", // 👈 put image in /public
};