import { Check } from "lucide-react";

interface SuccessStateProps {
  onReset: () => void;
}

export function SuccessState({ onReset }: SuccessStateProps) {
  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-white p-10 text-center shadow-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint">
        <Check size={28} strokeWidth={2.25} color="#00A372" />
      </div>
      <h2 className="mt-6 text-2xl font-medium text-ink">
        Thank you - your nomination has been submitted
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-body">
        The HR team will review it. We look forward to recognizing how our
        values are embodied by each of us.
      </p>
      <button
        onClick={onReset}
        className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full border-[1.5px] border-indigo px-6 text-sm font-medium text-indigo transition hover:bg-pale-indigo"
      >
        Submit another nomination
      </button>
    </div>
  );
}
