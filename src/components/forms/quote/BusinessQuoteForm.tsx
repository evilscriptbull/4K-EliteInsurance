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

const coverageTypeOptions = [
  { value: "business", label: "General Business" },
  { value: "general-liability", label: "General Liability" },
  { value: "workers-comp", label: "Workers' Compensation" },
  { value: "commercial-property", label: "Commercial Property" },
  { value: "builders-risk", label: "Builder's Risk" },
  { value: "commercial-auto", label: "Commercial Auto" },
  { value: "commercial-umbrella", label: "Commercial Umbrella" },
  { value: "contractors", label: "Contractors" },
  { value: "cyber", label: "Cyber" },
  { value: "other", label: "Other" },
];

export function BusinessQuoteForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/quote");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const success = await submit({
      family: "business",
      ...parseQuoteContactFields(formData),
      businessName: formData.get("businessName"),
      businessAddress: formData.get("businessAddress"),
      businessPhone: formData.get("businessPhone"),
      coverageType: formData.get("coverageType"),
      businessEntity: formData.get("businessEntity"),
      operationsDescription: formData.get("operationsDescription"),
      liabilityCoverageRequested: formData.get("liabilityCoverageRequested"),
    });

    if (success) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <HoneypotField />
      <QuoteContactFields fieldErrors={fieldErrors} />
      <TextField name="businessName" label="Name of Business" required error={fieldErrors.businessName?.[0]} />
      <TextField name="businessAddress" label="Business Address" required error={fieldErrors.businessAddress?.[0]} />
      <TextField name="businessPhone" label="Business Phone" type="tel" required error={fieldErrors.businessPhone?.[0]} />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="coverageType"
          label="Coverage Needed"
          required
          options={coverageTypeOptions}
          error={fieldErrors.coverageType?.[0]}
        />
        <SelectField
          name="businessEntity"
          label="Business Entity"
          required
          options={[
            { value: "individual", label: "Individual" },
            { value: "partnership", label: "Partnership" },
            { value: "corporation", label: "Corporation" },
            { value: "llc", label: "LLC" },
            { value: "other", label: "Other" },
          ]}
          error={fieldErrors.businessEntity?.[0]}
        />
      </div>
      <TextAreaField
        name="operationsDescription"
        label="Description of Business Operations"
        required
        error={fieldErrors.operationsDescription?.[0]}
      />
      <SelectField
        name="liabilityCoverageRequested"
        label="Liability Coverage Requested"
        required
        options={[
          { value: "5000000", label: "$5,000,000" },
          { value: "3000000", label: "$3,000,000" },
          { value: "2000000", label: "$2,000,000" },
          { value: "1000000", label: "$1,000,000" },
          { value: "500000", label: "$500,000" },
          { value: "300000", label: "$300,000" },
          { value: "other", label: "Other" },
        ]}
        error={fieldErrors.liabilityCoverageRequested?.[0]}
      />
      <TextAreaField name="notes" label="Additional info" />
      <FormStatus state={state} successMessage="Thanks — a licensed agent will follow up with your quote shortly." />
      <Button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Get My Quote"}
      </Button>
    </form>
  );
}
