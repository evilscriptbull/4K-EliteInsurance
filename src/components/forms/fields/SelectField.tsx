export interface SelectOption {
  value: string;
  label: string;
}

export function SelectField({
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
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-brand-800">
        {label}
        {required && " *"}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
