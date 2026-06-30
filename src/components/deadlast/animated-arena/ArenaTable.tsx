"use client";

export default function ArenaTable() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="
          relative
          h-[340px]
          w-[340px]
          rounded-full
          border-8
          border-amber-700
          bg-gradient-to-br
          from-green-900
          via-green-800
          to-green-950
          shadow-[0_0_80px_rgba(0,0,0,0.55)]
        "
      >
        <div
          className="
            absolute
            inset-8
            rounded-full
            border
            border-white/10
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            text-3xl
          "
        >
          ??
        </div>
      </div>
    </div>
  );
}
