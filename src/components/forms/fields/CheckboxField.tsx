import type { ReactNode } from "react";

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-brand-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1" />
      <span>{label}</span>
    </label>
  );
}
