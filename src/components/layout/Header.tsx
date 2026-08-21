import Link from "next/link";
import { agency } from "@/lib/config/agency";
import { navItems } from "@/components/layout/nav-items";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="relative bg-brand-900 text-white">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-xl font-semibold">
          {agency.legalName}
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-brand-100 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          <a href={`tel:${agency.phone}`} className="text-sm font-semibold text-white">
            {agency.phoneDisplay}
          </a>
          <Button href="/quote" size="sm">
            Get a Quote
          </Button>
        </div>

        <MobileNav />
      </Container>
    </header>
  );
}
