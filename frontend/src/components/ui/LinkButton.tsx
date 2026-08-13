import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-150";

const variants: Record<Variant, string> = {
  primary: "bg-neon-blue text-ink border border-neon-blue/60 hover:shadow-neon",
  secondary:
    "bg-transparent text-cream border border-line hover:border-neon-blue/60 hover:text-neon-blue",
};

interface LinkButtonProps extends LinkProps {
  variant?: Variant;
}

export function LinkButton({ variant = "primary", className = "", ...props }: LinkButtonProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
