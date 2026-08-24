import Link from "next/link";
import { LogoLockup } from "./Logomark";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  const secondaryHref = !user ? "/login" : user.isAdmin ? "/admin/nominations" : "/me";
  const secondaryLabel = !user ? "Log in" : user.isAdmin ? "Admin dashboard" : "My nominations";
  const secondaryLabelShort = !user ? "Log in" : user.isAdmin ? "Admin" : "Mine";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/[0.82] backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-10">
        <Link href="/" className="flex min-w-0 items-center">
          <LogoLockup height={18} />
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/#nominate"
            className="whitespace-nowrap rounded-full bg-indigo px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-hover sm:px-4"
          >
            Nominate
          </Link>
          <Link
            href={secondaryHref}
            className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-ink-body transition hover:bg-pale-indigo hover:text-indigo sm:px-4"
          >
            <span className="sm:hidden">{secondaryLabelShort}</span>
            <span className="hidden sm:inline">{secondaryLabel}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
