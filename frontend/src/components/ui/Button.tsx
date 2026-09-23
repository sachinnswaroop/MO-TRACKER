import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white border-transparent shadow-[var(--shadow-brand)] hover:brightness-105 active:brightness-95",
  secondary: "bg-white text-ink-700 hover:bg-ink-50 border-ink-200 shadow-[var(--shadow-soft)]",
  danger: "bg-danger-50 text-danger-600 hover:bg-red-100 border-danger-500/15",
  ghost: "bg-transparent text-ink-500 hover:bg-ink-100 border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
