import Link from "next/link";
import { agency } from "@/lib/config/agency";
import { navItems } from "@/components/layout/nav-items";
import { MobileNav } from "@/components/layout/MobileNav";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BrandMarkIcon } from "@/components/icons/brand";
import { PhoneIcon } from "@/components/icons/ui";

export function Header() {
  return (
    <header className="relative bg-brand-900 text-white">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold">
          <BrandMarkIcon className="size-7 text-accent-400 duotone-accent-400" />
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
          <a href={`tel:${agency.phone}`} className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <PhoneIcon className="size-4" />
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
