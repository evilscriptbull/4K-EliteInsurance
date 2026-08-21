export function TextAreaField({
  name,
  label,
  required,
  error,
  defaultValue,
  placeholder,
  rows = 4,
}: {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-brand-800">
        {label}
        {required && " *"}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
