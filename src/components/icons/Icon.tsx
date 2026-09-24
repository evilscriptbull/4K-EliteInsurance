import type { ReactNode } from "react";

/**
 * Base for every icon in src/components/icons/ — custom drawings on one
 * shared grid so they read as a single family:
 *
 * - 24×24 viewBox, artwork inside the central 20×20
 * - 1.5 stroke, round caps and joins, outline only (see Duotone for fills)
 * - Color is `currentColor`, so a `text-*` class sets it
 * - Renders at 24px until a `size-*` class overrides it
 *
 * Icons are decorative by default and hidden from screen readers, since on
 * this site they sit next to visible text. Pass `title` when the icon is the
 * only content of a link or button.
 */
export interface IconProps {
  className?: string;
  /** Accessible name — only for icons that carry meaning on their own. */
  title?: string;
  /** In viewBox units: the default 1.5 draws a 1.5px line at 24px. */
  strokeWidth?: number;
}

export function Icon({
  className,
  title,
  strokeWidth = 1.5,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * Wraps an icon's main surfaces (a truck's cargo box, a roof, a shield). They
 * stay unfilled until `--icon-duotone` is set, usually with the
 * `duotone-{color}` utility from globals.css on the icon or any ancestor:
 *
 *   <ShieldIcon className="size-10 text-brand-800 duotone-accent-200" />
 *
 * Shapes inside are still stroked unless they set `stroke="none"`, which is
 * how fill-only surfaces (ones whose outline is drawn by other strokes) work.
 */
export function Duotone({ children }: { children: ReactNode }) {
  return <g style={{ fill: "var(--icon-duotone, none)" }}>{children}</g>;
}
