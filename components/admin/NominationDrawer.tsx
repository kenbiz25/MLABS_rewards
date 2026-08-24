"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { TRAIT_MAP, type TraitKey } from "@/lib/traits";
import type { SerializedNomination } from "@/lib/serialize";

interface NominationDrawerProps {
  nomination: SerializedNomination | null;
  onClose: () => void;
}

export function NominationDrawer({ nomination, onClose }: NominationDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nomination) return;
    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nomination, onClose]);

  if (!nomination) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Nomination detail">
      <div
        className="absolute inset-0 bg-black/[0.32] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-[520px] overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between px-8 pt-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
              Nomination
            </p>
            <h2 className="mt-2 text-[30px] font-medium leading-tight text-ink">
              {nomination.nomineeName}
            </h2>
            <p className="mt-2 text-sm text-ink-faint">
              {nomination.countryName} · nominated by {nomination.nominatorName} ·{" "}
              {format(new Date(nomination.createdAt), "d MMM yyyy")}
            </p>
            <p className="mt-1 text-sm text-ink-ghost">{nomination.nominatorEmail}</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-ink-faint transition hover:bg-pale-indigo hover:text-indigo"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 px-8">
          {nomination.traits.map((t: TraitKey) => (
            <span
              key={t}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: TRAIT_MAP[t].tint, color: TRAIT_MAP[t].accent }}
            >
              {TRAIT_MAP[t].label}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-8 divide-y divide-border px-8 pb-10">
          <section>
            <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-ink-faint">
              The moment
            </h3>
            <p className="mt-3 text-[16px] leading-[1.65] text-ink-body">{nomination.momentText}</p>
          </section>
          <section className="pt-8">
            <h3 className="text-sm font-medium uppercase tracking-[0.08em] text-ink-faint">
              The impact
            </h3>
            <p className="mt-3 text-[16px] leading-[1.65] text-ink-body">{nomination.impactText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
