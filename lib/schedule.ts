// Global nomination windows are defined by a calendar start date and a
// duration, anchored to two fixed clock times rather than any specific
// country's local time: the window opens at 00:00 UTC on the start date,
// and closes at 00:00 WAT (UTC+1) on the day after the last day - i.e. the
// instant WAT clocks tick over into the next day. WAT doesn't observe
// daylight saving, so this offset is constant.

export const DEFAULT_WINDOW_DAYS = 16;

const WAT_OFFSET_MINUTES = 60; // UTC+1

interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseCalendarDate(dateStr: string): CalendarDate {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

function addDays(date: CalendarDate, days: number): CalendarDate {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day));
  d.setUTCDate(d.getUTCDate() + days);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function computeGlobalWindow(
  startDate: string,
  durationDays: number = DEFAULT_WINDOW_DAYS
): { opensAt: Date; closesAt: Date } {
  const start = parseCalendarDate(startDate);
  const closeDay = addDays(start, durationDays);

  const opensAt = new Date(Date.UTC(start.year, start.month - 1, start.day, 0, 0));
  const closesAt = new Date(
    Date.UTC(closeDay.year, closeDay.month - 1, closeDay.day, 0, 0) - WAT_OFFSET_MINUTES * 60_000
  );

  return { opensAt, closesAt };
}

// Default "start date" for a new cycle - today, in plain YYYY-MM-DD form.
export function todayDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
