export type Tone =
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "teal"
  | "indigo"
  | "red"
  | "yellow"
  | "violet"
  | "slate";

/** Bright gradient fills for icon circles/tiles (white icon on top). */
export const toneGradient: Record<Tone, string> = {
  blue: "from-sky-400 to-blue-500",
  cyan: "from-cyan-400 to-sky-500",
  green: "from-emerald-400 to-green-500",
  orange: "from-amber-400 to-orange-500",
  pink: "from-rose-400 to-pink-500",
  teal: "from-teal-400 to-cyan-600",
  indigo: "from-blue-500 to-indigo-600",
  red: "from-rose-500 to-red-500",
  yellow: "from-yellow-400 to-amber-500",
  violet: "from-violet-400 to-purple-500",
  slate: "from-slate-400 to-slate-600",
};

/** Soft tinted backgrounds for cards that carry a tone. */
export const toneSoft: Record<Tone, string> = {
  blue: "bg-sky-50 text-sky-700",
  cyan: "bg-cyan-50 text-cyan-700",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-amber-50 text-amber-700",
  pink: "bg-rose-50 text-rose-700",
  teal: "bg-teal-50 text-teal-700",
  indigo: "bg-indigo-50 text-indigo-700",
  red: "bg-red-50 text-red-700",
  yellow: "bg-yellow-50 text-yellow-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-100 text-slate-700",
};
