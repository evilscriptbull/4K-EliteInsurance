export type SubmitState = "idle" | "submitting" | "success" | "error";

export function FormStatus({
  state,
  successMessage,
  errorMessage,
}: {
  state: SubmitState;
  successMessage: string;
  errorMessage?: string;
}) {
  if (state === "success") {
    return <p className="rounded-md bg-success/10 p-4 text-success" role="status">{successMessage}</p>;
  }
  if (state === "error") {
    return (
      <p className="rounded-md bg-danger/10 p-4 text-danger" role="alert">
        {errorMessage ?? "Something went wrong. Please try again, or call us directly."}
      </p>
    );
  }
  return null;
}
