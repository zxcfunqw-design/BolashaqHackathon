import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

const variants: Record<ButtonVariant, string> = {
  primary: "bg-qadam-primary text-white shadow-soft hover:bg-qadam-primaryDark",
  secondary: "bg-white text-qadam-primary border border-qadam-border hover:border-qadam-primary/40",
  ghost: "bg-transparent text-qadam-graphite hover:bg-qadam-primary/5"
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
