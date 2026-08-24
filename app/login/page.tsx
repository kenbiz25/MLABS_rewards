import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logomark, LogoLockup } from "@/components/Logomark";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.isAdmin ? "/admin/nominations" : "/me");

  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative flex items-center justify-center bg-offwhite px-6 py-16 sm:px-10">
        <div className="w-full max-w-[380px]">
          <Link href="/" className="inline-block">
            <LogoLockup height={22} />
          </Link>
          <h1 className="mt-8 text-3xl font-medium text-ink sm:text-4xl">Sign in</h1>
          <p className="mt-2 text-[15px] text-ink-faint">
            Sign in to nominate, see your nomination history, and recognition
            results. HR team members also manage nominations from here.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-indigo lg:block">
        <div
          className="absolute inset-0 flex items-center justify-center motion-safe:animate-float"
          style={
            {
              maskImage: "radial-gradient(circle at 50% 55%, black 42%, transparent 78%)",
              WebkitMaskImage: "radial-gradient(circle at 50% 55%, black 42%, transparent 78%)",
              "--rot": "0deg",
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/comm.png" alt="" className="w-[78%] max-w-md" />
        </div>

        <Link href="/" className="absolute left-10 top-10 z-10 inline-block">
          <Logomark size={40} />
        </Link>
      </div>

      {/* Paints directly over the panel seam so it's a genuine color blend,
          not two panels each fading toward the same edge. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 z-20 hidden w-64 -translate-x-1/2 lg:block"
        style={{ background: "linear-gradient(to right, #FCFBF9 0%, #2514BE 100%)" }}
        aria-hidden="true"
      />
    </div>
  );
}
