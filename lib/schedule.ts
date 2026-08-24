// Global nomination windows are defined by a calendar start date and a
// duration. To guarantee every participating country gets the full nominal
// window, the window opens at 12:01 a.m. local time in Bangladesh (UTC+6,
// the farthest-ahead participating country) and closes at 11:59 p.m. local
// time in Sierra Leone (UTC+0, the farthest-behind participating country).
// Neither country observes daylight saving, so these offsets are constant.

export const DEFAULT_WINDOW_DAYS = 16;

const BANGLADESH_OFFSET_MINUTES = 6 * 60;
const SIERRA_LEONE_OFFSET_MINUTES = 0;

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
  const end = addDays(start, durationDays - 1);

  const opensAt = new Date(
    Date.UTC(start.year, start.month - 1, start.day, 0, 1) - BANGLADESH_OFFSET_MINUTES * 60_000
  );
  const closesAt = new Date(
    Date.UTC(end.year, end.month - 1, end.day, 23, 59) - SIERRA_LEONE_OFFSET_MINUTES * 60_000
  );

  return { opensAt, closesAt };
}

// Default "start date" for a new cycle — today, in plain YYYY-MM-DD form.
export function todayDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
