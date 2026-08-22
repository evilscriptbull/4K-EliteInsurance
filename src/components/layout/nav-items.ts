/**
 * Real, in-pass routes only — kept separate from marketing content so this
 * list stays type-checkable against next/link's typed routes. The 12 line
 * landing pages aren't linked here (they're reached via the homepage line
 * selector and each other via RelatedLines) to keep the header short.
 */
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/claims", label: "File a Claim" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;
