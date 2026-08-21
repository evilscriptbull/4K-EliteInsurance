/**
 * Real, in-pass routes only — kept separate from marketing content so this
 * list stays type-checkable against next/link's typed routes. /blog and the
 * 12 line landing pages aren't built yet, so they're deliberately excluded
 * here rather than linked as dead routes.
 */
export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/claims", label: "File a Claim" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;
