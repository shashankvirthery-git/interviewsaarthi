export default function Logo({ size = 44 }: { size?: number }) {
  const r = size / 2
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6c63ff"/>
          <stop offset="100%" stopColor="#00e5ff"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00e5ff"/>
          <stop offset="100%" stopColor="#06ffa5"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Rounded square background */}
      <rect width="44" height="44" rx="12" fill="url(#lg1)"/>
      {/* Inner glow */}
      <rect width="44" height="44" rx="12" fill="url(#lg2)" opacity="0.25"/>
      {/* Mic icon */}
      <rect x="17" y="8" width="10" height="14" rx="5" fill="white" opacity="0.95"/>
      <path d="M12 22c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.95"/>
      <line x1="22" y1="32" x2="22" y2="36" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="17" y1="36" x2="27" y2="36" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      {/* Sparkle dot */}
      <circle cx="32" cy="10" r="2.5" fill="#06ffa5" filter="url(#glow)"/>
    </svg>
  )
}
