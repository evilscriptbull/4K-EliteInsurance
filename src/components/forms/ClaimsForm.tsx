"use client";

import type { FormEvent } from "react";
import { useLeadFormSubmit } from "@/lib/forms/useLeadFormSubmit";
import { TextField } from "@/components/forms/fields/TextField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { RadioGroupField } from "@/components/forms/fields/RadioGroupField";
import { HoneypotField } from "@/components/forms/fields/HoneypotField";
import { FormStatus } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";

const yesNoNotSure = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
];

export function ClaimsForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/claims");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const success = await submit({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      email: formData.get("email") || undefined,
      filingFor: formData.get("filingFor"),
      policyNumber: formData.get("policyNumber"),
      incidentDate: formData.get("incidentDate"),
      incidentTime: formData.get("incidentTime"),
      anyoneInjured: formData.get("anyoneInjured"),
      needsRental: formData.get("needsRental"),
      whatHappened: formData.get("whatHappened"),
      policeReport: formData.get("policeReport") || undefined,
      company_website: formData.get("company_website"),
    });

    if (success) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <HoneypotField />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label="First Name" required error={fieldErrors.firstName?.[0]} />
        <TextField name="lastName" label="Last Name" required error={fieldErrors.lastName?.[0]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="phone" label="Phone" type="tel" required error={fieldErrors.phone?.[0]} />
        <TextField name="email" label="Email Address" type="email" error={fieldErrors.email?.[0]} />
      </div>
      <RadioGroupField
        name="filingFor"
        label="Who is filing?"
        required
        options={[
          { value: "myself", label: "Myself" },
          { value: "someone-else", label: "Someone else" },
        ]}
        error={fieldErrors.filingFor?.[0]}
      />
      <TextField name="policyNumber" label="Policy Number" required error={fieldErrors.policyNumber?.[0]} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="incidentDate" label="Incident Date" type="date" required error={fieldErrors.incidentDate?.[0]} />
        <TextField
          name="incidentTime"
          label="Incident Time (Central, estimate OK)"
          required
          error={fieldErrors.incidentTime?.[0]}
        />
      </div>
      <RadioGroupField
        name="anyoneInjured"
        label="Was anyone injured?"
        required
        options={yesNoNotSure}
        error={fieldErrors.anyoneInjured?.[0]}
      />
      <RadioGroupField
        name="needsRental"
        label="Are you in need of a rental?"
        required
        options={yesNoNotSure}
        error={fieldErrors.needsRental?.[0]}
      />
      <TextAreaField name="whatHappened" label="What happened?" required error={fieldErrors.whatHappened?.[0]} />
      <TextField name="policeReport" label="Police Report # (optional)" error={fieldErrors.policeReport?.[0]} />
      <FormStatus state={state} successMessage="Thanks — your claim has been submitted. Our team will follow up shortly." />
      <Button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Submit Claim"}
      </Button>
    </form>
  );
}
