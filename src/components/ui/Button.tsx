import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * href is typed directly from next/link's own prop type, so it automatically
 * inherits Next's typed-route checking — any href pointing at a route that
 * doesn't exist yet (e.g. one of the not-yet-built line landing pages) will
 * fail the build. For links to those, use ExternalLink instead.
 */
type LinkHref = ComponentProps<typeof Link>["href"];

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-accent-500 text-brand-950 hover:bg-accent-400",
  secondary: "bg-brand-800 text-white hover:bg-brand-700",
  outline: "border border-border text-foreground hover:bg-surface",
  ghost: "text-brand-700 hover:bg-surface",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
} as const;

interface ButtonProps {
  href?: LinkHref;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
