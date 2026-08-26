"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trophy, Megaphone } from "lucide-react";
import { DEFAULT_WINDOW_DAYS, todayDateString } from "@/lib/schedule";
import { WinnersEditor } from "./WinnersEditor";

interface Cycle {
  id: string;
  name: string;
  status: "DRAFT" | "OPEN" | "CLOSED";
  opensAt: string | null;
  closesAt: string | null;
  resultsPublishedAt: string | null;
  nominationCount: number;
}

const STATUS_STYLES: Record<Cycle["status"], string> = {
  DRAFT: "bg-border text-ink-faint",
  OPEN: "bg-mint text-green-deep",
  CLOSED: "bg-pale-indigo text-indigo",
};

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetweenInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
}

function effectiveState(c: Cycle): { label: string; className: string } {
  const now = Date.now();
  const opens = c.opensAt ? new Date(c.opensAt).getTime() : null;
  const closes = c.closesAt ? new Date(c.closesAt).getTime() : null;

  if (c.status === "DRAFT") return { label: "Not scheduled", className: "text-ink-ghost" };
  if (c.status === "CLOSED") return { label: "Force-closed", className: "text-deep-red" };
  // status === OPEN (activated) from here
  if (opens && now < opens) return { label: "Scheduled - not open yet", className: "text-ink-faint" };
  if (closes && now > closes) return { label: "Window ended", className: "text-ink-faint" };
  return { label: "Live now", className: "text-green-deep font-medium" };
}

interface WindowFormValue {
  name: string;
  startDate: string;
  endDate: string;
}

function WindowFields({
  value,
  onChange,
}: {
  value: WindowFormValue;
  onChange: (v: WindowFormValue) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Cycle name</label>
        <input
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="FY27 Q1"
          className="h-11 w-full rounded-input border-[1.5px] border-border-strong px-3.5 text-[15px] text-ink outline-none focus:border-indigo"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Start date</label>
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          className="h-11 w-full rounded-input border-[1.5px] border-border-strong px-3.5 text-[15px] text-ink outline-none focus:border-indigo"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">End date</label>
        <input
          type="date"
          min={value.startDate}
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          className="h-11 w-full rounded-input border-[1.5px] border-border-strong px-3.5 text-[15px] text-ink outline-none focus:border-indigo"
        />
      </div>
    </div>
  );
}

export function CycleManager() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [createValue, setCreateValue] = useState<WindowFormValue>({
    name: "FY27 Q1",
    startDate: todayDateString(),
    endDate: addDaysToDateString(todayDateString(), DEFAULT_WINDOW_DAYS - 1),
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<WindowFormValue | null>(null);
  const [winnersOpenId, setWinnersOpenId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/cycles")
      .then((r) => r.json())
      .then((data) => {
        setCycles(data.cycles);
        setLoading(false);
        setCreateValue((v) => ({ ...v, name: data.suggestedNextName ?? v.name }));
      });
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (createValue.name.trim().length < 2) {
      setError('Give the cycle a name, e.g. "FY27 Q1".');
      return;
    }
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createValue.name,
          startDate: createValue.startDate,
          durationDays: daysBetweenInclusive(createValue.startDate, createValue.endDate),
        }),
      });
      if (!res.ok) {
        setError("Couldn't create that cycle.");
        return;
      }
      load();
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: string, status: Cycle["status"]) {
    await fetch(`/api/admin/cycles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function setResultsPublished(id: string, resultsPublished: boolean) {
    await fetch(`/api/admin/cycles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultsPublished }),
    });
    load();
  }

  function startEdit(c: Cycle) {
    const startDate = c.opensAt ? format(new Date(c.opensAt), "yyyy-MM-dd") : todayDateString();
    setEditingId(c.id);
    setEditValue({
      name: c.name,
      startDate,
      endDate: c.closesAt
        ? format(new Date(c.closesAt), "yyyy-MM-dd")
        : addDaysToDateString(startDate, DEFAULT_WINDOW_DAYS - 1),
    });
  }

  async function saveEdit(id: string) {
    if (!editValue) return;
    await fetch(`/api/admin/cycles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editValue.name,
        startDate: editValue.startDate,
        durationDays: daysBetweenInclusive(editValue.startDate, editValue.endDate),
      }),
    });
    setEditingId(null);
    setEditValue(null);
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">HR Team</p>
        <h1 className="mt-2 text-4xl font-medium text-ink">Nomination cycles</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-body">
          Cycles are named by financial year and quarter. Pick a start date and a
          window automatically opens at 00:00 UTC on that date and closes at 00:00
          WAT on the day after the last day - no manual clock-watching required.
          Several cycles can be scheduled or live at the same time.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-card border border-border bg-white p-7 shadow-card"
      >
        <WindowFields value={createValue} onChange={setCreateValue} />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-indigo px-5 text-sm font-medium text-white transition hover:bg-indigo-hover disabled:opacity-60"
          >
            <Plus size={16} strokeWidth={2} />
            Create cycle
          </button>
          <p className="text-[13px] text-ink-faint">
            Created as a draft - activate it below when you're ready to schedule it.
          </p>
        </div>
        {error && <p className="text-sm text-deep-red">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card-lg">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[1.4fr_1fr_1.1fr_1.1fr_1fr_0.8fr_1.6fr] gap-4 border-b border-border bg-offwhite px-6 py-3">
              {["Cycle", "Status", "Opens (UTC)", "Closes (UTC)", "Live state", "Nominations", "Actions"].map(
                (label) => (
                  <span key={label} className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                    {label}
                  </span>
                )
              )}
            </div>

            {loading && <div className="px-6 py-8 text-sm text-ink-ghost">Loading…</div>}
            {!loading && cycles.length === 0 && (
              <div className="px-6 py-8 text-sm text-ink-ghost">No cycles yet. Create one above.</div>
            )}

            {cycles.map((c) => {
              const state = effectiveState(c);
              const isEditing = editingId === c.id;

              return (
                <div key={c.id} className="border-b border-border px-6 py-4 last:border-b-0">
                  {isEditing && editValue ? (
                    <div className="space-y-4">
                      <WindowFields value={editValue} onChange={setEditValue} />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="rounded-full bg-indigo px-4 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-hover"
                        >
                          Save window
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditValue(null);
                          }}
                          className="rounded-full border-[1.5px] border-border-strong px-4 py-1.5 text-xs font-medium text-ink-body"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[1.4fr_1fr_1.1fr_1.1fr_1fr_0.8fr_1.6fr] items-center gap-4">
                      <span className="text-[15px] font-medium text-ink">{c.name}</span>
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[c.status]}`}
                      >
                        {c.status}
                      </span>
                      <span className="text-sm text-ink-body">
                        {c.opensAt ? format(new Date(c.opensAt), "d MMM yyyy, HH:mm") : "-"}
                      </span>
                      <span className="text-sm text-ink-body">
                        {c.closesAt ? format(new Date(c.closesAt), "d MMM yyyy, HH:mm") : "-"}
                      </span>
                      <span className={`text-sm ${state.className}`}>{state.label}</span>
                      <span className="text-sm text-ink-body">{c.nominationCount}</span>
                      <span className="flex flex-wrap gap-2">
                        {c.status === "DRAFT" && (
                          <button
                            onClick={() => setStatus(c.id, "OPEN")}
                            className="rounded-full border-[1.5px] border-indigo px-3 py-1 text-xs font-medium text-indigo transition hover:bg-pale-indigo"
                          >
                            Activate
                          </button>
                        )}
                        {c.status === "OPEN" && (
                          <button
                            onClick={() => setStatus(c.id, "CLOSED")}
                            className="rounded-full border-[1.5px] border-border-strong px-3 py-1 text-xs font-medium text-ink-body transition hover:border-deep-red hover:text-deep-red"
                          >
                            Force close
                          </button>
                        )}
                        {c.status === "CLOSED" && (
                          <button
                            onClick={() => setStatus(c.id, "OPEN")}
                            className="rounded-full border-[1.5px] border-indigo px-3 py-1 text-xs font-medium text-indigo transition hover:bg-pale-indigo"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(c)}
                          className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-border-strong px-3 py-1 text-xs font-medium text-ink-body transition hover:border-indigo hover:text-indigo"
                        >
                          <Pencil size={12} strokeWidth={1.75} />
                          Edit window
                        </button>
                        <button
                          onClick={() => setWinnersOpenId(winnersOpenId === c.id ? null : c.id)}
                          className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-border-strong px-3 py-1 text-xs font-medium text-ink-body transition hover:border-indigo hover:text-indigo"
                        >
                          <Trophy size={12} strokeWidth={1.75} />
                          Winners
                        </button>
                        <button
                          onClick={() => setResultsPublished(c.id, !c.resultsPublishedAt)}
                          className={`inline-flex items-center gap-1 rounded-full border-[1.5px] px-3 py-1 text-xs font-medium transition ${
                            c.resultsPublishedAt
                              ? "border-green-deep text-green-deep hover:bg-mint/40"
                              : "border-border-strong text-ink-body hover:border-indigo hover:text-indigo"
                          }`}
                        >
                          <Megaphone size={12} strokeWidth={1.75} />
                          {c.resultsPublishedAt ? "Unpublish results" : "Publish results"}
                        </button>
                      </span>
                    </div>
                  )}
                  {winnersOpenId === c.id && (
                    <div className="mt-4">
                      <WinnersEditor cycleId={c.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
