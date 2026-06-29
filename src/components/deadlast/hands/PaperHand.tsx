type HandProps = {
  className?: string;
};

export default function PaperHand({ className = "" }: HandProps) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-label="Paper hand">
      <path d="M38 74c-8 1-14 8-14 16v36c0 14 11 25 25 25h54c16 0 29-13 29-29V52c0-7-6-13-13-13-5 0-9 3-12 7V34c0-7-6-13-13-13-6 0-11 4-13 10-2-6-7-10-13-10-7 0-13 6-13 13v8c-2-5-7-8-13-8-7 0-13 6-13 13v36l-7-9z" fill="currentColor" />
      <path d="M45 83V47" stroke="rgba(255,255,255,.55)" strokeWidth="8" strokeLinecap="round" />
      <path d="M68 78V34" stroke="rgba(255,255,255,.5)" strokeWidth="8" strokeLinecap="round" />
      <path d="M92 78V34" stroke="rgba(255,255,255,.42)" strokeWidth="8" strokeLinecap="round" />
      <path d="M116 83V52" stroke="rgba(255,255,255,.34)" strokeWidth="8" strokeLinecap="round" />
      <path d="M43 116c15 8 37 10 64 4" fill="none" stroke="rgba(0,0,0,.28)" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 137h47" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
