import type { Metadata } from "next";
import Link from "next/link";
import { agency } from "@/lib/config/agency";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "SMS Terms and Conditions",
  description: `Terms governing SMS text communications from ${agency.legalName}.`,
};

export default function SmsTermsPage() {
  return (
    <>
      <Section background="brand">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Terms and Conditions for SMS Communications</h1>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-8 text-lg text-brand-800">
          <p>
            These Terms and Conditions govern your use of SMS communications sent by {agency.legalName}
            (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) and set forth important information about
            your rights and obligations when receiving SMS messages from us. By opting in to receive SMS
            communications from us, you agree to the following terms.
          </p>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">1. Opt-In Consent</h2>
            <p>
              By providing your phone number and opting in to receive SMS communications, you consent to
              receive marketing and transactional messages, including but not limited to policy updates,
              reminders, promotions, customer support, and other related communications from{" "}
              {agency.legalName}. You may receive SMS messages that may include notifications regarding
              quotes, account status, policy renewals, and general customer service communications.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">2. Types of Messages You Will Receive</h2>
            <p>By opting in, you consent to receiving the following types of messages via SMS:</p>
            <p>
              <strong>Transactional Messages:</strong> These include account updates, claims status, payment
              reminders, policy changes, and other customer service-related communications.
            </p>
            <p>
              <strong>Promotional Messages:</strong> These may include offers, discounts, or updates about our
              products and services.
            </p>
            <p>
              Messages may be sent by automated systems, but will also include opt-out instructions to allow
              you to manage your preferences.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">3. Frequency of Messages</h2>
            <p>
              You may receive a varying number of SMS messages depending on the services you use or have opted
              into. The frequency of messages may vary, and you will receive SMS communications as necessary to
              fulfill your service requests.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">4. Message and Data Rates</h2>
            <p>
              Message and data rates may apply depending on your mobile carrier. Please check with your mobile
              provider for information regarding potential charges for receiving SMS messages. {agency.legalName}{" "}
              is not responsible for any fees that may be charged by your mobile service provider.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">5. Opt-Out Instructions</h2>
            <p>
              You can opt out of receiving SMS messages at any time by replying &ldquo;STOP&rdquo; to any
              message you receive. After opting out, you will receive a confirmation message that your request
              has been processed, and you will no longer receive SMS communications from us unless you opt back
              in.
            </p>
            <p>If you have any issues with opting out, you can also contact our customer support team for assistance.</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">6. Help Instructions</h2>
            <p>
              If you need assistance or have questions regarding the SMS communications you&rsquo;ve received,
              you can reply &ldquo;HELP&rdquo; to any SMS message to receive information on how to manage your
              preferences, or contact our customer service team directly at:
            </p>
            <p>
              Email: <a href={`mailto:${agency.email}`} className="text-accent-700 hover:underline">{agency.email}</a>
              <br />
              Phone: <a href={`tel:${agency.phone}`} className="text-accent-700 hover:underline">{agency.phoneDisplay}</a>
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">7. Compliance with Applicable Laws</h2>
            <p>
              {agency.legalName} complies with all applicable regulations regarding SMS marketing, including
              but not limited to the Telephone Consumer Protection Act (TCPA), the Controlling the Assault of
              Non-Solicited Pornography And Marketing (CAN-SPAM) Act, and other relevant laws governing consent,
              marketing, and privacy practices related to SMS communications.
            </p>
            <p>By opting in, you agree to the following:</p>
            <p>You are the account holder for the phone number provided and are authorized to receive messages at that number.</p>
            <p>You acknowledge that you are providing express written consent to receive SMS messages from us.</p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">8. Termination of SMS Communications</h2>
            <p>
              We reserve the right to terminate or suspend SMS communications to you at any time, for any
              reason, including but not limited to if we believe you are violating these terms, or in the event
              that the services you have opted into are no longer available.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">9. Changes to These Terms</h2>
            <p>
              {agency.legalName} may update these Terms and Conditions from time to time to reflect changes in
              our practices or to comply with applicable laws. If we make significant changes, we will notify
              you via SMS or post the updated terms on our website. Your continued use of SMS communications
              after any updates signifies your acceptance of the revised Terms and Conditions.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">10. Limitation of Liability</h2>
            <p>
              {agency.legalName} is not liable for any delay, failure, or malfunction in receiving or
              delivering SMS messages due to network issues, carrier-related issues, or any other technical
              difficulties outside of our control. We do not guarantee the availability or performance of SMS
              communications.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-brand-900">11. Contact Us</h2>
            <p>For any questions regarding these Terms and Conditions or to manage your SMS preferences, please contact us:</p>
            <p>
              {agency.legalName}
              <br />
              Email: <a href={`mailto:${agency.email}`} className="text-accent-700 hover:underline">{agency.email}</a>
              <br />
              Phone: <a href={`tel:${agency.phone}`} className="text-accent-700 hover:underline">{agency.phoneDisplay}</a>
              <br />
              Address: {agency.address.street}, {agency.address.city}, {agency.address.state} {agency.address.zip}
            </p>
            <p>
              See also our <Link href="/privacy" className="text-accent-700 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
