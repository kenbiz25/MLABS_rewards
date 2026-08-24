import Link from "next/link";
import { LogoLockup } from "@/components/Logomark";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="inline-block">
          <LogoLockup height={22} />
        </Link>
        <h1 className="mt-8 text-3xl font-medium text-ink sm:text-4xl">Reset your password</h1>
        <p className="mt-2 text-[15px] text-ink-faint">
          Enter your account email and we'll send you a link to reset your password.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
        <Link href="/login" className="mt-6 inline-block text-sm text-ink-faint hover:text-indigo hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
