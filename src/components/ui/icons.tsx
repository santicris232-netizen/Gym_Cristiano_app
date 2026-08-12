import type { SVGProps } from "react";

export function BarbellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12h2" />
      <path d="M4 9v6" />
      <path d="M6 8v8" />
      <path d="M8 11v2" />
      <path d="M8 12h8" />
      <path d="M16 11v2" />
      <path d="M18 8v8" />
      <path d="M20 9v6" />
      <path d="M22 12h-2" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.5l2.76 6.06 6.64.63-5.03 4.43 1.5 6.52L12 16.9l-5.87 3.24 1.5-6.52-5.03-4.43 6.64-.63L12 2.5z" />
    </svg>
  );
}

export function FlameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1.5-1-2.5-1-2.5s2 1 2 5a7 7 0 1 1-14 0c0-4.5 3-6.5 3-9.5 1 1 2 2 4 0Z" />
    </svg>
  );
}
