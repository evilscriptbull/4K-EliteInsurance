/**
 * Basic spam mitigation: a visually-hidden field real users never fill in.
 * Bots that auto-fill every field will populate it, and the server rejects
 * (silently, with a fake success) any submission where it's non-empty.
 */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
      <label htmlFor="company_website">Leave this field empty</label>
      <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
