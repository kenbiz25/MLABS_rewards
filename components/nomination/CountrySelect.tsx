"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PARTICIPATING_COUNTRIES as COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
}

export function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const errorId = useId();

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  function selectCountry(code: string) {
    onChange(code);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) selectCountry(item.code);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label htmlFor="country-input" className="mb-1.5 block text-sm font-medium text-ink">
        Country the nominee is based in
      </label>
      <div className="relative">
        <input
          id="country-input"
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong bg-white px-4 pr-10 text-[15px] text-ink outline-none transition focus:border-indigo"
          placeholder="Search countries…"
          value={open ? query : selected?.name ?? ""}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-ghost"
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-input border border-border bg-white py-1 shadow-card-lg"
        >
          {filtered.length === 0 && (
            <li className="px-4 py-2 text-sm text-ink-ghost">No countries match.</li>
          )}
          {filtered.map((c, i) => (
            <li
              key={c.code}
              role="option"
              aria-selected={c.code === value}
              className={`cursor-pointer px-4 py-2 text-[15px] ${
                i === activeIndex ? "bg-pale-indigo text-indigo" : "text-ink-body"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectCountry(c.code);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {c.name}
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
