import type { LucideIcon } from "lucide-react";
import { toneGradient, type Tone } from "../../lib/tones";

/** Bright gradient circle with a white icon — the app's main tap target. */
export function IconTile({
  icon: Icon,
  tone,
  size = 52,
  className = "",
}: {
  icon: LucideIcon;
  tone: Tone;
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-[0_6px_14px_-4px_rgba(11,27,58,0.28)] ${toneGradient[tone]} ${className}`}
    >
      <Icon size={Math.round(size * 0.44)} strokeWidth={2.1} />
    </span>
  );
}

/** Icon + label stacked, used in the icon grids (Home, More). */
export function IconGridItem({
  icon,
  tone,
  label,
  sub,
  onClick,
  badge,
}: {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  sub?: React.ReactNode;
  onClick: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex min-w-0 flex-col items-center gap-1.5 rounded-2xl px-1 py-2 text-center transition-transform active:scale-95"
    >
      <span className="relative">
        <IconTile icon={icon} tone={tone} />
        {badge}
      </span>
      <span className="w-full text-[12px] font-semibold leading-tight text-ink-800">{label}</span>
      {sub !== undefined && <span className="-mt-1 text-[11px] font-medium text-ink-400">{sub}</span>}
    </button>
  );
}
