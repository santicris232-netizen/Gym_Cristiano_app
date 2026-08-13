import { type HTMLAttributes } from "react";

type Tone = "neutral" | "blue" | "gold" | "red";

const tones: Record<Tone, string> = {
  neutral: "border-line text-cream-dim",
  blue: "border-neon-blue/50 text-neon-blue",
  gold: "border-neon-gold/50 text-neon-gold",
  red: "border-usa-red/60 text-usa-red",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
