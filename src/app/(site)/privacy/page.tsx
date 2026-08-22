import type { Metadata } from "next";
import { agency } from "@/lib/config/agency";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${agency.legalName} collects, uses, and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Section background="brand">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Privacy Policy</h1>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-8 text-lg text-brand-800">
          <p>
            At {agency.legalName}, we are committed to protecting your privacy and ensuring that your personal
            information is handled in a safe and responsible manner. This Privacy Policy outlines how we
            collect, use, and protect your personal information when you visit our website, use our services,
            or interact with us in any other way.
          </p>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">1. Information We Collect</h2>
            <p>We may collect the following types of personal information:</p>
            <p>
              <strong>Personal Identifiable Information (PII):</strong> This includes your name, address, email
              address, phone number, date of birth, and other information necessary to provide you with our
              services.
            </p>
            <p>
              <strong>Payment Information:</strong> If you purchase products or services from us, we may
              collect payment-related information, such as credit card details or bank account information.
            </p>
            <p>
              <strong>Non-Personal Information:</strong> This includes information about your device, browser
              type, IP address, and usage patterns when you interact with our website.
            </p>
            <p>
              <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to
              enhance your experience on our website and collect analytical data.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">2. How We Use Your Information</h2>
            <p>We may use your personal information for the following purposes:</p>
            <p>
              <strong>To Provide Services:</strong> To deliver insurance quotes, process claims, and manage your
              policy.
            </p>
            <p>
              <strong>Communication:</strong> To respond to your inquiries, send updates about your insurance
              coverage, and offer customer support.
            </p>
            <p>
              <strong>Marketing and Promotions:</strong> To send you marketing communications about our
              services, promotions, and updates (you can opt out of these communications at any time).
            </p>
            <p>
              <strong>Improvement of Our Services:</strong> To enhance the functionality of our website and
              services based on your feedback and usage patterns.
            </p>
            <p>
              <strong>Legal Obligations:</strong> To comply with legal obligations, such as responding to
              requests from law enforcement or regulatory authorities.
            </p>
            <p>
              We will never share your mobile information with third parties for marketing purposes without
              your explicit consent.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">3. Sharing Your Information</h2>
            <p>We may share your personal information with third parties in the following situations:</p>
            <p>
              <strong>Service Providers:</strong> We may share your information with trusted third-party
              service providers who assist us with customer support, payment processing, and website
              maintenance.
            </p>
            <p>
              <strong>Legal Requirements:</strong> We may disclose your information when required by law or if
              we believe it is necessary to comply with a legal process, protect our rights, or prevent fraud.
            </p>
            <p>
              <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets,
              your personal information may be transferred to the new owner.
            </p>
            <p>
              We will not transfer your personal data to external organizations without your consent, except as
              required by law or as necessary to provide our services. We have implemented strict access
              controls and data protection measures to prevent unauthorized sharing of your information.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">4. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information from unauthorized
              access, disclosure, alteration, and destruction. While we strive to protect your information, no
              method of electronic transmission or storage is 100% secure. Therefore, we cannot guarantee
              absolute security.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">5. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <p>
              <strong>Access:</strong> You can request access to the personal information we hold about you.
            </p>
            <p>
              <strong>Correction:</strong> You can request corrections to any inaccurate or incomplete personal
              information.
            </p>
            <p>
              <strong>Deletion:</strong> You can request that we delete your personal information, subject to
              any legal obligations.
            </p>
            <p>
              <strong>Opt-Out of Marketing:</strong> You can opt out of receiving marketing communications at
              any time by following the unsubscribe instructions in the emails we send. To opt out of SMS
              communications, reply &lsquo;STOP&rsquo; to any message you receive from us.
            </p>
            <p>
              <strong>Data Portability:</strong> You may request a copy of your personal data in a structured,
              commonly used, and machine-readable format.
            </p>
            <p>To exercise your rights, please contact us using the details below.</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">6. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or services that are not operated by{" "}
              {agency.legalName}. We are not responsible for the privacy practices of these third-party sites.
              We encourage you to review their privacy policies before providing any personal information.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will post the revised policy
              on our website. We encourage you to review this policy periodically to stay informed about how we
              are protecting your information.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how we handle your personal
              information, please contact us at:
            </p>
            <p>
              {agency.legalName}
              <br />
              Email: <a href={`mailto:${agency.email}`} className="text-accent-700 hover:underline">{agency.email}</a>
              <br />
              Phone: <a href={`tel:${agency.phone}`} className="text-accent-700 hover:underline">{agency.phoneDisplay}</a>
              <br />
              Address: {agency.address.street}, {agency.address.city}, {agency.address.state} {agency.address.zip}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
