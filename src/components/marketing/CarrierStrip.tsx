import { carriers } from "@/lib/config/agency";

/**
 * Carrier names render as text, not logos — logo/trademark usage rights are
 * still an open question (docs/open-questions.md). Naming the carriers is
 * safe; using their image assets isn't yet.
 */
export function CarrierStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {carriers.map((carrier) => (
        <span key={carrier} className="font-serif text-lg font-medium text-brand-700">
          {carrier}
        </span>
      ))}
    </div>
  );
}
