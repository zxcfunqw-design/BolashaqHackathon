import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  "data-testid"?: string;
}>;

export function Card({
  children,
  className = "",
  onClick,
  selected = false,
  "data-testid": testId
}: CardProps) {
  const base =
    "rounded-[22px] border bg-qadam-card p-4 shadow-soft transition active:scale-[0.99]";
  const state = selected ? "border-qadam-primary ring-2 ring-qadam-primary/15" : "border-qadam-border";
  const clickable = onClick ? "cursor-pointer" : "";

  return (
    <section
      className={`${base} ${state} ${clickable} ${className}`}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </section>
  );
}
