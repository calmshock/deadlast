"use client";

import { useEffect, useState } from "react";

type EntryToastData = {
  id: number;
  amount: number;
};

type EntryToastProps = {
  toast: EntryToastData | null;
};

export default function EntryToast({ toast }: EntryToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const hideId = window.setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => window.clearTimeout(hideId);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 flex justify-center px-4">
      <div
        className={`rounded-3xl border border-amber-300/30 bg-[#121218]/95 px-6 py-4 shadow-[0_0_32px_rgba(251,191,36,0.18)] transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.28em] text-amber-200/60">
            Prize Cycle
          </div>
          <div className="mt-1 text-3xl font-black uppercase text-amber-200">
            +{toast.amount} Entry
          </div>
          <div className="mt-1 text-sm text-white/70">
            Added to today&apos;s draw
          </div>
        </div>
      </div>
    </div>
  );
}