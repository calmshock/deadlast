type HandProps = {
  className?: string;
};

export default function RockHand({ className = "" }: HandProps) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-label="Rock hand">
      <path d="M45 76c-10 2-17 12-15 23l7 34c2 10 11 17 21 17h45c14 0 25-11 25-25V73c0-8-6-14-14-14-4 0-8 2-11 5-2-6-7-10-14-10-5 0-10 3-12 7-3-6-8-10-15-10-8 0-14 6-14 14v12l-3-1z" fill="currentColor" />
      <path d="M49 77V44c0-8 6-14 14-14s14 6 14 14v31" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="8" strokeLinecap="round" />
      <path d="M78 75V38c0-8 6-14 14-14s14 6 14 14v42" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="8" strokeLinecap="round" />
      <path d="M106 82V50c0-8 6-14 14-14s14 6 14 14v53" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="8" strokeLinecap="round" />
      <path d="M41 92c14-5 30-3 42 7" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="7" strokeLinecap="round" />
      <path d="M54 127h48" fill="none" stroke="rgba(0,0,0,.3)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
