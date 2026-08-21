"use client";

import type { FormEvent } from "react";
import { useLeadFormSubmit } from "@/lib/forms/useLeadFormSubmit";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField } from "@/components/forms/fields/SelectField";
import { RadioGroupField } from "@/components/forms/fields/RadioGroupField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { HoneypotField } from "@/components/forms/fields/HoneypotField";
import { FormStatus } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";
import { QuoteContactFields, parseQuoteContactFields } from "@/components/forms/quote/QuoteContactFields";
import { trackLeadCreatedFromResponse } from "@/lib/analytics/track";

export function RecreationalQuoteForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/quote");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const { success, data } = await submit({
      family: "recreational",
      ...parseQuoteContactFields(formData),
      vehicleType: formData.get("vehicleType"),
      dateOfBirth: formData.get("dateOfBirth"),
      vehicleYear: formData.get("vehicleYear"),
      vehicleMake: formData.get("vehicleMake"),
      vehicleModel: formData.get("vehicleModel"),
      coverageType: formData.get("coverageType"),
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
      <SelectField
        name="vehicleType"
        label="Vehicle Type"
        required
        options={[
          { value: "boat", label: "Boat" },
          { value: "motorcycle", label: "Motorcycle" },
          { value: "rv", label: "RV" },
          { value: "other", label: "Other (e.g. ATV)" },
        ]}
        error={fieldErrors.vehicleType?.[0]}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="dateOfBirth" label="Date of Birth" type="date" required error={fieldErrors.dateOfBirth?.[0]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField name="vehicleYear" label="Vehicle Year" required error={fieldErrors.vehicleYear?.[0]} />
        <TextField name="vehicleMake" label="Vehicle Make" required error={fieldErrors.vehicleMake?.[0]} />
        <TextField name="vehicleModel" label="Vehicle Model" required error={fieldErrors.vehicleModel?.[0]} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <RadioGroupField
          name="coverageType"
          label="Full Coverage or Liability?"
          required
          options={[
            { value: "full", label: "Full Coverage" },
            { value: "liability-only", label: "Liability Only" },
          ]}
          error={fieldErrors.coverageType?.[0]}
        />
        <SelectField
          name="liabilityLimits"
          label="Liability Limits"
          required
          options={[
            { value: "250-500", label: "250/500" },
            { value: "100-300", label: "100/300" },
            { value: "50-100", label: "50/100" },
            { value: "other", label: "Other" },
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
