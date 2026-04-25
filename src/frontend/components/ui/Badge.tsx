import type { PropsWithChildren } from "react";

type BadgeTone = "green" | "blue" | "yellow" | "gray";

const tones: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-800 border-emerald-100",
  blue: "bg-blue-50 text-blue-800 border-blue-100",
  yellow: "bg-yellow-50 text-yellow-800 border-yellow-100",
  gray: "bg-slate-50 text-slate-700 border-slate-100"
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
