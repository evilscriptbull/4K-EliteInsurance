"use client";

import type { FormEvent } from "react";
import { useLeadFormSubmit } from "@/lib/forms/useLeadFormSubmit";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField } from "@/components/forms/fields/SelectField";
import { CheckboxField } from "@/components/forms/fields/CheckboxField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { HoneypotField } from "@/components/forms/fields/HoneypotField";
import { FormStatus } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";
import { QuoteContactFields, parseQuoteContactFields } from "@/components/forms/quote/QuoteContactFields";

export function LifeQuoteForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/quote");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const success = await submit({
      family: "life",
      ...parseQuoteContactFields(formData),
      amountRequested: Number(formData.get("amountRequested")),
      product: formData.get("product"),
      height: formData.get("height"),
      weight: formData.get("weight"),
      tobaccoUser: formData.get("tobaccoUser") === "on",
      medicationsSurgeries: formData.get("medicationsSurgeries") || undefined,
    });

    if (success) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <HoneypotField />
      <QuoteContactFields fieldErrors={fieldErrors} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="amountRequested"
          label="Amount of Insurance Requested ($)"
          type="number"
          required
          error={fieldErrors.amountRequested?.[0]}
        />
        <SelectField
          name="product"
          label="Product"
          required
          options={[
            { value: "term", label: "Term Life" },
            { value: "whole-life", label: "Whole Life" },
            { value: "final-expense", label: "Final Expense" },
          ]}
          error={fieldErrors.product?.[0]}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="height" label="Height" required error={fieldErrors.height?.[0]} />
        <TextField name="weight" label="Weight" required error={fieldErrors.weight?.[0]} />
      </div>
      <CheckboxField name="tobaccoUser" label="Tobacco user" />
      <TextAreaField
        name="medicationsSurgeries"
        label="Medications or major surgeries in the past 5 years (optional)"
      />
      <FormStatus state={state} successMessage="Thanks — a licensed agent will follow up with your quote shortly." />
      <Button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Get My Quote"}
      </Button>
    </form>
  );
}
