"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { TRAIT_MAP, type TraitKey } from "@/lib/traits";

interface MyNomination {
  id: string;
  nomineeName: string;
  countryName: string;
  traits: TraitKey[];
  cycleName: string;
  createdAt: string;
}

interface WinnerCycle {
  cycleId: string;
  cycleName: string;
  winners: { nomineeName: string; trait: TraitKey }[];
}

export function EmployeeHome({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const [tab, setTab] = useState<"nominations" | "results">("nominations");
  const [nominations, setNominations] = useState<MyNomination[] | null>(null);
  const [winnerCycles, setWinnerCycles] = useState<WinnerCycle[] | null>(null);

  useEffect(() => {
    fetch("/api/nominations/mine")
      .then((r) => r.json())
      .then((data) => setNominations(data.nominations ?? []));
    fetch("/api/winners")
      .then((r) => r.json())
      .then((data) => setWinnerCycles(data.cycles ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-page px-6 py-12 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">Your account</p>
          <h1 className="mt-2 text-4xl font-medium text-ink">Welcome back, {name.split(" ")[0]}.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/nominations"
              className="inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-border-strong px-4 text-sm font-medium text-ink-body transition hover:border-indigo hover:text-indigo"
            >
              <ShieldCheck size={16} strokeWidth={1.75} />
              Go to admin dashboard
            </Link>
          )}
          <Link
            href="/#nominate"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo px-4 text-sm font-medium text-white transition hover:bg-indigo-hover"
          >
            Start a new nomination
            <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <button
          onClick={() => setTab("nominations")}
          className={`h-10 rounded-full px-4 text-sm font-medium transition ${
            tab === "nominations" ? "bg-indigo text-white" : "border border-border-strong text-ink-body"
          }`}
        >
          Your nominations
        </button>
        <button
          onClick={() => setTab("results")}
          className={`h-10 rounded-full px-4 text-sm font-medium transition ${
            tab === "results" ? "bg-indigo text-white" : "border border-border-strong text-ink-body"
          }`}
        >
          Results
        </button>
      </div>

      {tab === "nominations" ? (
        <div className="mt-6 space-y-3">
          {nominations === null && <p className="text-sm text-ink-ghost">Loading…</p>}
          {nominations?.length === 0 && (
            <div className="rounded-card border border-border bg-white p-8 text-center shadow-card">
              <p className="text-[15px] text-ink-body">You haven't submitted a nomination yet.</p>
              <Link
                href="/#nominate"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo hover:underline"
              >
                Nominate someone <ArrowRight size={14} strokeWidth={1.75} />
              </Link>
            </div>
          )}
          {nominations?.map((n) => (
            <div key={n.id} className="rounded-card border border-border bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[15px] font-medium text-ink">{n.nomineeName}</p>
                <p
                  className="text-sm text-ink-ghost"
                  title={format(new Date(n.createdAt), "d MMMM yyyy, HH:mm")}
                >
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-1 text-sm text-ink-faint">
                {n.countryName} · {n.cycleName}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {n.traits.map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: TRAIT_MAP[t].tint, color: TRAIT_MAP[t].accent }}
                  >
                    {TRAIT_MAP[t].label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {winnerCycles === null && <p className="text-sm text-ink-ghost">Loading…</p>}
          {winnerCycles?.length === 0 && (
            <div className="rounded-card border border-border bg-white p-8 text-center shadow-card">
              <p className="text-[15px] text-ink-body">Results haven't been shared yet.</p>
              <p className="mt-1 text-sm text-ink-faint">Check back once a cycle's honorees are announced.</p>
            </div>
          )}
          {winnerCycles?.map((c) => (
            <div key={c.cycleId} className="rounded-card border border-border bg-white p-7 shadow-card">
              <p className="text-sm font-medium uppercase tracking-[0.08em] text-ink-faint">{c.cycleName}</p>
              <p className="mt-1 text-[15px] text-ink-body">Congratulations to this cycle's honorees:</p>
              <div className="mt-3 space-y-2">
                {c.winners.map((w) => (
                  <div key={w.trait} className="flex flex-wrap items-center gap-2">
                    <span
                      className="w-56 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
                      style={{ backgroundColor: TRAIT_MAP[w.trait].tint, color: TRAIT_MAP[w.trait].accent }}
                    >
                      {TRAIT_MAP[w.trait].label}
                    </span>
                    <span className="rounded-full bg-pale-indigo px-3 py-1.5 text-sm font-medium text-indigo">
                      {w.nomineeName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
