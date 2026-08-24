"use client";

import { Check } from "lucide-react";
import { TRAITS, type TraitKey } from "@/lib/traits";

interface TraitToggleProps {
  value: TraitKey[];
  onChange: (traits: TraitKey[]) => void;
  error?: string;
}

export function TraitToggle({ value, onChange, error }: TraitToggleProps) {
  function toggle(key: TraitKey) {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
  }

  return (
    <fieldset>
      <legend className="sr-only">Which Core Trait does this nomination reflect?</legend>
      <p className="mb-3 text-sm text-ink-faint">Select all that apply.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRAITS.map((trait) => {
          const checked = value.includes(trait.key);
          return (
            <label
              key={trait.key}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                checked
                  ? "border-indigo bg-pale-indigo text-indigo"
                  : "border-border-strong bg-white text-ink"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(trait.key)}
              />
              <span
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition ${
                  checked ? "border-indigo bg-indigo" : "border-border-strong bg-white"
                }`}
                aria-hidden="true"
              >
                {checked && <Check size={14} strokeWidth={3} color="white" />}
              </span>
              <span className="text-[15px] font-medium">{trait.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-deep-red">{error}</p>}
    </fieldset>
  );
}
