"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex h-10 items-center justify-center rounded-full bg-pale-indigo px-4 text-sm font-medium text-indigo transition hover:bg-lavender/40 disabled:opacity-60"
    >
      Sign out
    </button>
  );
}
