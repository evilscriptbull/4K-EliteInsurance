import Link from "next/link";
import { agency, licensedStates } from "@/lib/config/agency";
import { disclaimers } from "@/lib/compliance/disclaimers";
import { navItems } from "@/components/layout/nav-items";
import { Container } from "@/components/ui/Container";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-brand-200">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <p className="font-serif text-lg font-semibold text-white">{agency.legalName}</p>
          <p>{agency.address.street}</p>
          <p>
            {agency.address.city}, {agency.address.state} {agency.address.zip}
          </p>
          <p>{agency.hours}</p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-white">Contact</p>
          <p>
            <a href={`tel:${agency.phone}`} className="hover:text-white">
              {agency.phoneDisplay}
            </a>
          </p>
          <p>
            <a href={`mailto:${agency.email}`} className="hover:text-white">
              {agency.email}
            </a>
          </p>
          <div className="flex gap-4 pt-2">
            <ExternalLink href={agency.social.facebook} className="hover:text-white">
              Facebook
            </ExternalLink>
            <ExternalLink href={agency.social.instagram} className="hover:text-white">
              Instagram
            </ExternalLink>
            <ExternalLink href={agency.social.linkedin} className="hover:text-white">
              LinkedIn
            </ExternalLink>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-white">Quick Links</p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-white">Licensed In</p>
          <p>{licensedStates.join(", ")}</p>
          <p className="pt-2">
            <ExternalLink href={agency.social.trustedChoiceProfile} className="hover:text-white">
              Trusted Choice Profile
            </ExternalLink>
          </p>
        </div>
      </Container>

      <div className="border-t border-brand-800">
        <Container className="flex flex-col gap-2 py-6 text-xs text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {agency.legalName}. All rights reserved.
          </p>
          <p className="max-w-2xl">{disclaimers.noBindingViaForm}</p>
        </Container>
      </div>
    </footer>
  );
}
