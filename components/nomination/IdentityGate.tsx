"use client";

import { useState } from "react";
import { format } from "date-fns";
import { identitySchema } from "@/lib/schemas";

interface IdentityGateProps {
  cycleName: string;
  closesAt?: string | null;
  onContinue: (identity: { nominatorName: string; nominatorEmail: string }) => Promise<string | null>;
  initialValues?: { nominatorName: string; nominatorEmail: string };
}

export function IdentityGate({ cycleName, closesAt, onContinue, initialValues }: IdentityGateProps) {
  const [nominatorName, setNominatorName] = useState(initialValues?.nominatorName ?? "");
  const [nominatorEmail, setNominatorEmail] = useState(initialValues?.nominatorEmail ?? "");
  const [errors, setErrors] = useState<{ nominatorName?: string; nominatorEmail?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const result = identitySchema.safeParse({ nominatorName, nominatorEmail });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setChecking(true);
    const error = await onContinue(result.data);
    setChecking(false);
    if (error) setSubmitError(error);
  }

  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-white p-9 shadow-card">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
        {cycleName}
        {closesAt ? ` · closes ${format(new Date(closesAt), "d MMMM yyyy")}` : ""}
      </p>
      <h2 className="mt-3 text-2xl font-medium text-ink">Before you begin</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-body">
        Tell us who you are so we can confirm this nomination. You can submit
        one nomination per window.
      </p>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="nominator-name" className="mb-1.5 block text-sm font-medium text-ink">
            Your name
          </label>
          <input
            id="nominator-name"
            type="text"
            className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong px-4 text-[15px] text-ink outline-none transition focus:border-indigo"
            value={nominatorName}
            onChange={(e) => setNominatorName(e.target.value)}
            aria-invalid={!!errors.nominatorName}
            aria-describedby={errors.nominatorName ? "nominator-name-error" : undefined}
          />
          {errors.nominatorName && (
            <p id="nominator-name-error" className="mt-1.5 text-sm text-deep-red">
              {errors.nominatorName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="nominator-email" className="mb-1.5 block text-sm font-medium text-ink">
            Your work email
          </label>
          <input
            id="nominator-email"
            type="email"
            className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong px-4 text-[15px] text-ink outline-none transition focus:border-indigo"
            value={nominatorEmail}
            onChange={(e) => setNominatorEmail(e.target.value)}
            aria-invalid={!!errors.nominatorEmail}
            aria-describedby={errors.nominatorEmail ? "nominator-email-error" : undefined}
          />
          {errors.nominatorEmail ? (
            <p id="nominator-email-error" className="mt-1.5 text-sm text-deep-red">
              {errors.nominatorEmail}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-ink-faint">
              Please use your work email (@medtroniclabs.org or @medtronic.com) - this
              confirms who's nominating.
            </p>
          )}
        </div>

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl bg-[#FDEDED] px-4 py-3 text-sm text-deep-red">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={checking}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-indigo px-6 text-sm font-medium text-white transition hover:bg-indigo-hover disabled:opacity-60"
        >
          {checking ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
