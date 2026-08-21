import { licensedStates } from "@/lib/config/agency";
import { disclaimers } from "@/lib/compliance/disclaimers";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField } from "@/components/forms/fields/SelectField";
import { CheckboxField } from "@/components/forms/fields/CheckboxField";

const stateOptions = licensedStates.map((state) => ({ value: state, label: state }));

/**
 * Shared contact block for all 6 quote-family forms (firstName, lastName,
 * phone, email, state, SMS consent). Only the quote forms ask for SMS
 * consent — see docs/architecture.md and lib/compliance/disclaimers.ts.
 */
/** Parses the shared contact fields out of a quote form's FormData. */
export function parseQuoteContactFields(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    state: formData.get("state"),
    smsConsent: formData.get("smsConsent") === "on",
    notes: formData.get("notes") || undefined,
    company_website: formData.get("company_website"),
  };
}

export function QuoteContactFields({ fieldErrors }: { fieldErrors: Record<string, string[]> }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label="First Name" required error={fieldErrors.firstName?.[0]} />
        <TextField name="lastName" label="Last Name" required error={fieldErrors.lastName?.[0]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="phone" label="Phone" type="tel" required error={fieldErrors.phone?.[0]} />
        <TextField name="email" label="Email Address" type="email" required error={fieldErrors.email?.[0]} />
      </div>
      <SelectField name="state" label="State" required options={[...stateOptions]} defaultValue="TN" error={fieldErrors.state?.[0]} />
      <CheckboxField name="smsConsent" label={disclaimers.smsConsent} />
    </>
  );
}
