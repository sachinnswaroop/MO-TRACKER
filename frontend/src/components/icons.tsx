import { createLucideIcon } from "lucide-react";

/** Activity: a play-chevron in a circle with a small person badge (MO activity / monitor). */
export const ActivityUserIcon = createLucideIcon("ActivityUser", [
  ["path", { d: "M20.6 11.2A9.5 9.5 0 1 0 11.2 20.6", key: "ring" }],
  ["path", { d: "m9.5 8.5 3.5 3.5-3.5 3.5", key: "chev" }],
  ["circle", { cx: "18", cy: "16.2", r: "2.3", key: "head" }],
  ["path", { d: "M13.6 22a4.4 4.4 0 0 1 8.8 0", key: "body" }],
]);
