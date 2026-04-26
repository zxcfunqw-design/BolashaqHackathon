import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

const variants: Record<ButtonVariant, string> = {
  primary: "bg-qadam-primary text-qadam-primaryContrast shadow-soft hover:bg-qadam-primaryDark",
  secondary:
    "border border-qadam-border bg-qadam-card text-qadam-graphite hover:border-qadam-primary/50 hover:bg-qadam-primary/10 dark:hover:bg-qadam-primary/15",
  ghost: "bg-transparent text-qadam-graphite hover:bg-qadam-primary/10 dark:hover:bg-qadam-primary/15"
};

export function Button({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
