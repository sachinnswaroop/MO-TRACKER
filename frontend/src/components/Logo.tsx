/** The Central Bank of India app icon (frontend/public/icon-512.png), used wherever the app's mark appears. */
export function Logo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/icon-192.png"
      width={size}
      height={size}
      alt="MO Tracker"
      className={`shrink-0 rounded-[22%] object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
