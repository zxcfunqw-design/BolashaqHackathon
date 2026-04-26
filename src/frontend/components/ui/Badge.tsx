import type { PropsWithChildren } from "react";

type BadgeTone = "green" | "blue" | "yellow" | "gray";

const tones: Record<BadgeTone, string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-100",
  blue: "border-blue-100 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/12 dark:text-blue-100",
  yellow: "border-yellow-100 bg-yellow-50 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/14 dark:text-yellow-100",
  gray: "border-slate-100 bg-slate-50 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/14 dark:text-slate-100"
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
