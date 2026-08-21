"use client";

import type { FormEvent } from "react";
import { useLeadFormSubmit } from "@/lib/forms/useLeadFormSubmit";
import { TextField } from "@/components/forms/fields/TextField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { HoneypotField } from "@/components/forms/fields/HoneypotField";
import { FormStatus } from "@/components/forms/FormStatus";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const { state, fieldErrors, submit } = useLeadFormSubmit("/api/contact");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const success = await submit({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      message: formData.get("message"),
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
        <TextField name="email" label="Email Address" type="email" required error={fieldErrors.email?.[0]} />
      </div>
      <TextAreaField name="message" label="Message" required error={fieldErrors.message?.[0]} />
      <FormStatus state={state} successMessage="Thanks — we'll be in touch shortly." />
      <Button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
