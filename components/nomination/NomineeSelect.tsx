"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

interface NomineeSelectProps {
  value: string;
  onChange: (name: string) => void;
  error?: string;
}

// Free-text input backed by a filtered dropdown of everyone who's signed in
// before (see /api/users/nominatable) - picking from the list avoids typos
// in a colleague's name, but typing a name that isn't in the list (e.g.
// someone who hasn't signed in yet) still works.
export function NomineeSelect({ value, onChange, error }: NomineeSelectProps) {
  const [names, setNames] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const errorId = useId();

  useEffect(() => {
    fetch("/api/users/nominatable")
      .then((r) => r.json())
      .then((data) => setNames(data.names ?? []))
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return names;
    return names.filter((n) => n.toLowerCase().includes(q));
  }, [names, value]);

  function selectName(name: string) {
    onChange(name);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const item = filtered[activeIndex];
      if (item) {
        e.preventDefault();
        selectName(item);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label htmlFor="nominee-name" className="mb-1.5 block text-sm font-medium text-ink">
        Nominee's name
      </label>
      <input
        id="nominee-name"
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        placeholder="Start typing a name…"
        className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong px-4 text-[15px] text-ink outline-none transition focus:border-indigo"
        value={value}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(0);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />

      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-input border border-border bg-white py-1 shadow-card-lg"
        >
          {filtered.map((n, i) => (
            <li
              key={n}
              role="option"
              aria-selected={n === value}
              className={`cursor-pointer px-4 py-2 text-[15px] ${
                i === activeIndex ? "bg-pale-indigo text-indigo" : "text-ink-body"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectName(n);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {n}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-deep-red">
          {error}
        </p>
      )}
    </div>
  );
}
