import { useId } from "react";

export function Logo({ size = 44, className = "" }: { size?: number; className?: string }) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="MO Tracker"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2fd0ff" />
          <stop offset="1" stopColor="#1467f0" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill={`url(#${gradientId})`} />
      <path d="M12 27L18.5 19.5L23.5 24.5L32 14" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25.5 14H32V20.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="27" r="2.1" fill="white" />
      <circle cx="23.5" cy="24.5" r="2.1" fill="white" />
    </svg>
  );
}
