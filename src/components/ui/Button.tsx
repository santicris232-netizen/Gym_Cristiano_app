import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold uppercase tracking-wide transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:shadow-neon cursor-pointer disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-neon-blue text-ink border border-neon-blue/60 hover:shadow-neon",
  secondary:
    "bg-transparent text-cream border border-line hover:border-neon-blue/60 hover:text-neon-blue",
  danger:
    "bg-usa-red text-cream border border-usa-red hover:shadow-[0_0_18px_rgba(179,36,42,0.5)]",
  ghost:
    "bg-transparent text-cream-dim border border-transparent hover:text-cream hover:border-line",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  },
);
