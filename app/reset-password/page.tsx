import Link from "next/link";
import { LogoLockup } from "@/components/Logomark";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="inline-block">
          <LogoLockup height={22} />
        </Link>
        <h1 className="mt-8 text-3xl font-medium text-ink sm:text-4xl">Set a new password</h1>

        {!token ? (
          <>
            <p className="mt-2 text-[15px] text-ink-body">
              This reset link is missing its token. Request a new one below.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block text-sm font-medium text-indigo hover:underline"
            >
              Request a new reset link
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px] text-ink-faint">Choose a new password for your account.</p>
            <div className="mt-8">
              <ResetPasswordForm token={token} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
