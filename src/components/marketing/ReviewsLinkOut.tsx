import { agency } from "@/lib/config/agency";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Card } from "@/components/ui/Card";

/**
 * Deliberately takes no testimonial/quote/author props — we don't have real
 * review content sourced yet, and inventing any would be dishonest. Links
 * out to real third-party profiles only. Add a Google Business Profile link
 * here once that access is confirmed (see docs/open-questions.md).
 */
export function ReviewsLinkOut() {
  return (
    <Card className="text-center">
      <p className="text-brand-700">
        See what clients say about working with {agency.legalName} on our Trusted Choice profile.
      </p>
      <div className="mt-4">
        <ExternalLink
          href={agency.social.trustedChoiceProfile}
          className="font-semibold text-brand-700 underline hover:text-brand-900"
        >
          View our Trusted Choice reviews
        </ExternalLink>
      </div>
    </Card>
  );
}
