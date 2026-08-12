import {
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  forwardRef,
} from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-md border border-line bg-surface-2 px-3.5 py-2.5 text-cream placeholder:text-cream-dim/50 outline-none transition focus:border-neon-blue focus:shadow-neon ${className}`}
      {...props}
    />
  );
});

export function Label({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block font-mono text-xs uppercase tracking-widest text-cream-dim ${className}`}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-usa-red">{children}</p>;
}
