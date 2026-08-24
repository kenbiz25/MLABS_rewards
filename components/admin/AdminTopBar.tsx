import Link from "next/link";
import { UserRound } from "lucide-react";
import { LogoLockup } from "@/components/Logomark";
import { SignOutButton } from "./SignOutButton";

interface AdminTopBarProps {
  active: "nominations" | "cycles" | "team";
}

export function AdminTopBar({ active }: AdminTopBarProps) {
  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-dashboard flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4 sm:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoLockup height={24} />
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            <Link
              href="/admin/nominations"
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active === "nominations" ? "bg-pale-indigo text-indigo" : "text-ink-body hover:bg-pale-indigo"
              }`}
            >
              Nominations
            </Link>
            <Link
              href="/admin/cycles"
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active === "cycles" ? "bg-pale-indigo text-indigo" : "text-ink-body hover:bg-pale-indigo"
              }`}
            >
              Cycles
            </Link>
            <Link
              href="/admin/team"
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active === "team" ? "bg-pale-indigo text-indigo" : "text-ink-body hover:bg-pale-indigo"
              }`}
            >
              Team
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/me"
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-border-strong px-3.5 text-sm font-medium text-ink-body transition hover:border-indigo hover:text-indigo"
          >
            <UserRound size={14} strokeWidth={1.75} />
            <span className="hidden sm:inline">View as employee</span>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
