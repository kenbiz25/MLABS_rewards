"use client";

import { useEffect, useState } from "react";
import { nominationSchema } from "@/lib/schemas";
import type { TraitKey } from "@/lib/traits";
import { ProgressRail } from "./ProgressRail";
import { ClosedNotice } from "./ClosedNotice";
import { IdentityGate } from "./IdentityGate";
import { CountrySelect } from "./CountrySelect";
import { NomineeSelect } from "./NomineeSelect";
import { TraitToggle } from "./TraitToggle";
import { SuccessState } from "./SuccessState";

type Step = "loading" | "closed" | "identity" | "form" | "success";

interface CycleInfo {
  id: string;
  name: string;
  closesAt: string | null;
}

interface FormState {
  nomineeName: string;
  countryCode: string;
  traits: TraitKey[];
  momentText: string;
  impactText: string;
}

const EMPTY_FORM: FormState = {
  nomineeName: "",
  countryCode: "",
  traits: [],
  momentText: "",
  impactText: "",
};

export function NominationFlow() {
  const [step, setStep] = useState<Step>("loading");
  const [cycle, setCycle] = useState<CycleInfo | null>(null);
  const [nextCycle, setNextCycle] = useState<{ name: string; opensAt: string | null } | null>(null);
  const [identity, setIdentity] = useState<{ nominatorName: string; nominatorEmail: string } | null>(null);
  const [sessionIdentity, setSessionIdentity] = useState<{ nominatorName: string; nominatorEmail: string } | null>(
    null
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setSessionIdentity({ nominatorName: data.user.name, nominatorEmail: data.user.email });
        }
      })
      .catch(() => undefined);

    fetch("/api/cycles/current")
      .then((r) => r.json())
      .then((data) => {
        if (data.open) {
          setCycle(data.cycle);
          setStep("identity");
        } else {
          setNextCycle(data.next ?? null);
          setStep("closed");
        }
      })
      .catch(() => setStep("closed"));
  }, []);

  async function handleIdentityContinue(id: { nominatorName: string; nominatorEmail: string }) {
    const res = await fetch("/api/nominations/eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nominatorEmail: id.nominatorEmail }),
    });
    const data = await res.json();

    if (!data.eligible) {
      if (data.reason === "duplicate") {
        return "You've already submitted a nomination for this window. Thank you for participating.";
      }
      setStep("closed");
      return null;
    }

    setIdentity(id);
    setStep("form");
    return null;
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const completed = [
    form.nomineeName.trim().length > 0 && form.countryCode.length > 0,
    form.traits.length > 0,
    form.momentText.trim().length >= 200 && form.momentText.length <= 1500,
    form.impactText.trim().length >= 100 && form.impactText.length <= 1500,
  ].filter(Boolean).length;

  const totalQuestions = 4;
  const isValid = completed === totalQuestions;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identity) return;

    const payload = { ...identity, ...form, companyWebsite: "" };
    const result = nominationSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (res.status === 201) {
        setStep("success");
      } else if (res.status === 409) {
        setSubmitError("You've already submitted a nomination for this window.");
      } else if (res.status === 403) {
        setStep("closed");
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setForm(EMPTY_FORM);
    setIdentity(null);
    setErrors({});
    setSubmitError(null);
    setStep("loading");
    fetch("/api/cycles/current")
      .then((r) => r.json())
      .then((data) => {
        if (data.open) {
          setCycle(data.cycle);
          setStep("identity");
        } else {
          setNextCycle(data.next ?? null);
          setStep("closed");
        }
      });
  }

  if (step === "loading") {
    return <div className="h-40" />;
  }

  if (step === "closed") {
    return <ClosedNotice nextCycleName={nextCycle?.name} nextOpensAt={nextCycle?.opensAt} />;
  }

  if (step === "identity" && cycle) {
    return (
      <IdentityGate
        cycleName={cycle.name}
        closesAt={cycle.closesAt}
        onContinue={handleIdentityContinue}
        initialValues={sessionIdentity ?? undefined}
      />
    );
  }

  if (step === "success") {
    return <SuccessState onReset={resetAll} />;
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
      <ProgressRail completed={completed} total={totalQuestions} />

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="rounded-card border border-border bg-white p-9 shadow-card">
          <QuestionHeading number="01" title="Who are you nominating?" />
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <NomineeSelect
              value={form.nomineeName}
              onChange={(name) => updateField("nomineeName", name)}
              error={errors.nomineeName}
            />
            <CountrySelect
              value={form.countryCode}
              onChange={(code) => updateField("countryCode", code)}
              error={errors.countryCode}
            />
          </div>
        </div>

        <div className="rounded-card border border-border bg-white p-9 shadow-card">
          <QuestionHeading number="02" title="Which Core Trait does this nomination reflect?" />
          <div className="mt-5">
            <TraitToggle
              value={form.traits}
              onChange={(traits) => updateField("traits", traits)}
              error={errors.traits}
            />
          </div>
        </div>

        <div className="rounded-card border border-border bg-white p-9 shadow-card">
          <QuestionHeading number="03" title="Describe the specific moment or action." />
          <p className="mt-2 text-sm text-ink-faint">
            3–5 sentences. What happened? When did it happen? What did this person do?
          </p>
          <textarea
            rows={6}
            className="mt-4 w-full rounded-[14px] border-[1.5px] border-border-strong p-4 text-[15px] text-ink outline-none transition focus:border-indigo"
            value={form.momentText}
            onChange={(e) => updateField("momentText", e.target.value)}
            maxLength={1500}
            aria-invalid={!!errors.momentText}
            aria-describedby="moment-counter"
          />
          <p id="moment-counter" className="mt-1.5 text-right text-sm text-ink-ghost">
            {form.momentText.length} / 1500
          </p>
          {errors.momentText && <p className="text-sm text-deep-red">{errors.momentText}</p>}
        </div>

        <div className="rounded-card border border-border bg-white p-9 shadow-card">
          <QuestionHeading number="04" title="What was the impact?" />
          <p className="mt-2 text-sm text-ink-faint">
            On the team, the patient, the project, or the organization.
          </p>
          <textarea
            rows={5}
            className="mt-4 w-full rounded-[14px] border-[1.5px] border-border-strong p-4 text-[15px] text-ink outline-none transition focus:border-indigo"
            value={form.impactText}
            onChange={(e) => updateField("impactText", e.target.value)}
            maxLength={1500}
            aria-invalid={!!errors.impactText}
            aria-describedby="impact-counter"
          />
          <p id="impact-counter" className="mt-1.5 text-right text-sm text-ink-ghost">
            {form.impactText.length} / 1500
          </p>
          {errors.impactText && <p className="text-sm text-deep-red">{errors.impactText}</p>}
        </div>

        {/* Honeypot field: real users never see or fill this. */}
        <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" />

        {submitError && (
          <div className="rounded-xl bg-[#FDEDED] px-4 py-3 text-sm text-deep-red">{submitError}</div>
        )}

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-indigo px-7 text-sm font-medium text-white transition hover:bg-indigo-hover disabled:opacity-45"
          >
            {submitting ? "Submitting…" : "Submit nomination"}
          </button>
          <p className="text-[13px] text-ink-faint">
            {isValid ? "Ready to submit." : "Complete all four questions to submit."}
          </p>
        </div>
      </form>
    </div>
  );
}

function QuestionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-sm font-medium text-indigo">{number}</span>
      <h3 className="text-xl font-medium text-ink sm:text-[22px]">{title}</h3>
    </div>
  );
}
