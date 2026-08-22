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

export function CollectorVehicleQuoteForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/quote");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const { success, data } = await submit({
      family: "collector-vehicle",
      ...parseQuoteContactFields(formData),
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      vehicleYear: formData.get("vehicleYear"),
      vehicleMake: formData.get("vehicleMake"),
      vehicleModel: formData.get("vehicleModel"),
      estimatedValue: Number(formData.get("estimatedValue")),
      mileagePlan: formData.get("mileagePlan"),
      liabilityLimits: formData.get("liabilityLimits"),
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
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField name="vehicleYear" label="Vehicle Year" required error={fieldErrors.vehicleYear?.[0]} />
        <TextField name="vehicleMake" label="Vehicle Make" required error={fieldErrors.vehicleMake?.[0]} />
        <TextField name="vehicleModel" label="Vehicle Model" required error={fieldErrors.vehicleModel?.[0]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="estimatedValue"
          label="Estimated Value ($)"
          type="number"
          required
          error={fieldErrors.estimatedValue?.[0]}
        />
        <TextField name="dateOfBirth" label="Date of Birth" type="date" error={fieldErrors.dateOfBirth?.[0]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          name="mileagePlan"
          label="Mileage Plan per Year"
          required
          options={[
            { value: "1000", label: "1,000 miles" },
            { value: "3000", label: "3,000 miles" },
            { value: "6000", label: "6,000 miles" },
          ]}
          error={fieldErrors.mileagePlan?.[0]}
        />
        <SelectField
          name="liabilityLimits"
          label="Liability Limits"
          required
          options={[
            { value: "500000", label: "$500,000" },
            { value: "300000", label: "$300,000" },
            { value: "100000", label: "$100,000" },
            { value: "50000", label: "$50,000" },
            { value: "full-coverage", label: "Full Coverage" },
          ]}
          error={fieldErrors.liabilityLimits?.[0]}
        />
      </div>
      <TextAreaField name="notes" label="Additional drivers, vehicles, or coverage notes" />
      <FormStatus state={state} successMessage="Thanks — a licensed agent will follow up with your quote shortly." />
      <Button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Get My Quote"}
      </Button>
    </form>
  );
}
