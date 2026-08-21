import type { SelectOption } from "@/components/forms/fields/SelectField";

export function RadioGroupField({
  name,
  label,
  options,
  required,
  error,
  defaultValue,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  defaultValue?: string;
}) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-brand-800">
        {label}
        {required && " *"}
      </legend>
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-brand-700">
            <input
              type="radio"
              name={name}
              value={option.value}
              required={required}
              defaultChecked={defaultValue === option.value}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </fieldset>
  );
}
