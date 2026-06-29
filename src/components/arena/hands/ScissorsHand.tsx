type HandProps = {
  className?: string;
};

export default function ScissorsHand({ className = "" }: HandProps) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-label="Scissors hand">
      <path d="M39 78c-9 2-15 10-14 19l5 30c2 14 14 24 28 24h43c16 0 29-13 29-29V79c0-8-6-14-14-14-5 0-9 2-12 6-2-7-8-12-16-12-5 0-10 3-13 7l-4-29c-1-8-8-13-16-12s-13 8-12 16l5 40-9-3z" fill="currentColor" />
      <path d="M56 82 45 31c-2-8 3-15 11-17s15 3 17 11l15 55" fill="none" stroke="rgba(255,255,255,.52)" strokeWidth="8" strokeLinecap="round" />
      <path d="M86 78 111 25c3-7 11-10 18-7s10 11 7 18l-28 58" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="8" strokeLinecap="round" />
      <path d="M44 100c14-4 29-1 41 8" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="7" strokeLinecap="round" />
      <path d="M55 130h46" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
