"use client";

import { ArenaProgressProvider } from "@/contexts/ArenaProgressContext";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArenaProgressProvider>{children}</ArenaProgressProvider>;
}
