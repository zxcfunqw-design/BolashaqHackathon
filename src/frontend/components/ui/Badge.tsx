import type { PropsWithChildren } from "react";

type BadgeTone = "green" | "blue" | "yellow" | "gray";

const tones: Record<BadgeTone, string> = {
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-400/15 dark:text-emerald-50",
  blue:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-400/35 dark:bg-blue-400/15 dark:text-blue-50",
  yellow:
    "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-300/35 dark:bg-yellow-300/20 dark:text-yellow-50",
  gray:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/35 dark:bg-slate-400/15 dark:text-slate-50"
};

export function Badge({
  children,
  tone = "gray",
  className = ""
}: PropsWithChildren<{ tone?: BadgeTone; className?: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
