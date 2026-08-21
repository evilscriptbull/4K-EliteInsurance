import type { ReactNode } from "react";

/**
 * For genuinely external URLs (social profiles, partner sites, third-party
 * directories) — opens in a new tab. Not for internal routes that don't
 * exist yet; those should be a plain same-tab <a> with a comment explaining
 * why next/link's typed routes couldn't be used (see LineSelector.tsx).
 */
export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
