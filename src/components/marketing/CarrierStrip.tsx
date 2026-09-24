import Image from "next/image";
import { carriers } from "@/lib/config/agency";
import { carrierLogos } from "@/lib/config/media";

/**
 * Real logos for the carriers that have one in the curated media library
 * (see src/lib/config/media.ts) -- Builders Mutual still renders as text.
 * These are genuine trademarked marks, not the agency's own asset: flag to
 * Chaz before treating this as final, same as any other logo/trademark
 * usage question (docs/open-questions.md).
 */
export function CarrierStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
      {carriers.map((carrier) => {
        const logo = carrierLogos[carrier];
        if (!logo) {
          return (
            <span key={carrier} className="font-serif text-lg font-medium text-brand-700">
              {carrier}
            </span>
          );
        }
        return (
          <Image
            key={carrier}
            src={logo}
            alt={carrier}
            width={160}
            height={40}
            className="h-8 w-auto object-contain sm:h-10"
          />
        );
      })}
    </div>
  );
}
