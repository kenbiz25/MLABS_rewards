"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { loginSchema, signupSchema } from "@/lib/schemas";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const schema = mode === "login" ? loginSchema : signupSchema;
    const payload = mode === "login" ? { email, password } : { name, email, password };
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the details and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.isAdmin ? "/admin/nominations" : "/me");
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <form className="w-full space-y-5" onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
              Your name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong px-4 text-[15px] text-ink outline-none transition focus:border-indigo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong px-4 text-[15px] text-ink outline-none transition focus:border-indigo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            {mode === "login" && (
              <Link href="/forgot-password" className="text-sm text-ink-faint hover:text-indigo hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="min-h-[48px] w-full rounded-input border-[1.5px] border-border-strong px-4 text-[15px] text-ink outline-none transition focus:border-indigo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-[#FDEDED] px-4 py-3 text-sm text-deep-red">
            <AlertCircle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-indigo px-6 text-sm font-medium text-white transition hover:bg-indigo-hover disabled:opacity-60"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
        }}
        className="mt-4 text-sm text-ink-faint underline-offset-2 hover:text-indigo hover:underline"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
