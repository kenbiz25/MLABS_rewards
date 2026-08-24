import { CalendarClock } from "lucide-react";
import { format } from "date-fns";

interface ClosedNoticeProps {
  nextCycleName?: string;
  nextOpensAt?: string | null;
}

export function ClosedNotice({ nextCycleName, nextOpensAt }: ClosedNoticeProps) {
  return (
    <div className="mx-auto max-w-xl rounded-card border border-border bg-white p-10 text-center shadow-card">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pale-indigo">
        <CalendarClock size={26} strokeWidth={1.75} color="#2514BE" />
      </div>
      <h2 className="mt-5 text-2xl font-medium text-ink">
        Nominations are currently closed
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-body">
        {nextCycleName
          ? `The next window, ${nextCycleName}, opens${
              nextOpensAt ? ` on ${format(new Date(nextOpensAt), "d MMMM yyyy")}` : " soon"
            }. Check back then.`
          : "There's no open nomination window right now. Check back soon, or contact the Medtronic LABS HR Team."}
      </p>
    </div>
  );
}
