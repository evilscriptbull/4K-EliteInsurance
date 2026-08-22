"use client";

import type { FormEvent } from "react";
import { useLeadFormSubmit } from "@/lib/forms/useLeadFormSubmit";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField } from "@/components/forms/fields/SelectField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { HoneypotField } from "@/components/forms/fields/HoneypotField";
import { FormStatus } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";
import { QuoteContactFields, parseQuoteContactFields } from "@/components/forms/quote/QuoteContactFields";
import { trackLeadCreatedFromResponse } from "@/lib/analytics/track";

export function HomeQuoteForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/quote");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const { success, data } = await submit({
      family: "home",
      ...parseQuoteContactFields(formData),
      dateOfBirth: formData.get("dateOfBirth"),
      dwellingCoverageAmount: Number(formData.get("dwellingCoverageAmount")),
      liabilityLimit: formData.get("liabilityLimit"),
      deductible: formData.get("deductible"),
    });

    if (success) {
      trackLeadCreatedFromResponse(data);
      form.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <HoneypotField />
      <QuoteContactFields fieldErrors={fieldErrors} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="dateOfBirth" label="Date of Birth" type="date" required error={fieldErrors.dateOfBirth?.[0]} />
        <TextField
          name="dwellingCoverageAmount"
          label="Dwelling Coverage Amount ($)"
          type="number"
          required
          error={fieldErrors.dwellingCoverageAmount?.[0]}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="liabilityLimit"
          label="Liability Limit"
          required
          options={[
            { value: "500000", label: "$500,000" },
            { value: "300000", label: "$300,000" },
            { value: "100000", label: "$100,000" },
          ]}
          error={fieldErrors.liabilityLimit?.[0]}
        />
        <SelectField
          name="deductible"
          label="Deductible"
          required
          options={[
            { value: "1000", label: "$1,000" },
            { value: "2500", label: "$2,500" },
            { value: "5000", label: "$5,000" },
            { value: "other", label: "Other" },
          ]}
          error={fieldErrors.deductible?.[0]}
        />
      </div>
      <TextAreaField name="notes" label="Additional coverage or property info" />
      <FormStatus state={state} successMessage="Thanks — a licensed agent will follow up with your quote shortly." />
      <Button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Get My Quote"}
      </Button>
    </form>
  );
}
