"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { UserPlus } from "lucide-react";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export function AdminUserManager() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function load() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isAdmin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't create that account.");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      load();
    } finally {
      setCreating(false);
    }
  }

  async function toggleAdmin(user: TeamUser) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    });
    if (res.ok) load();
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">HR Team</p>
        <h1 className="mt-2 text-4xl font-medium text-ink">Team access</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-body">
          Grant or remove admin access for any account. Employees create their
          own account by signing up - you only need this form to add someone
          who doesn't have an account yet.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 gap-4 rounded-card border border-border bg-white p-7 shadow-card sm:grid-cols-[1fr_1.2fr_1fr_auto_auto]"
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-input border-[1.5px] border-border-strong px-3.5 text-[15px] text-ink outline-none focus:border-indigo"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-input border-[1.5px] border-border-strong px-3.5 text-[15px] text-ink outline-none focus:border-indigo"
        />
        <input
          type="password"
          placeholder="Temporary password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-input border-[1.5px] border-border-strong px-3.5 text-[15px] text-ink outline-none focus:border-indigo"
        />
        <label className="flex items-center gap-2 text-sm text-ink-body">
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
          Admin
        </label>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-indigo px-5 text-sm font-medium text-white transition hover:bg-indigo-hover disabled:opacity-60"
        >
          <UserPlus size={16} strokeWidth={2} />
          Add
        </button>
        {error && <p className="text-sm text-deep-red sm:col-span-5">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card-lg">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr_1fr_0.8fr] gap-4 border-b border-border bg-offwhite px-6 py-3">
              {["Name", "Email", "Role", "Joined", "Action"].map((label) => (
                <span key={label} className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  {label}
                </span>
              ))}
            </div>

            {loading && <div className="px-6 py-8 text-sm text-ink-ghost">Loading…</div>}

            {users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1.2fr_1.4fr_0.8fr_1fr_0.8fr] items-center gap-4 border-b border-border px-6 py-4 last:border-b-0"
              >
                <span className="truncate text-[15px] font-medium text-ink">{u.name}</span>
                <span className="truncate text-sm text-ink-body">{u.email}</span>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.isAdmin ? "bg-mint text-green-deep" : "bg-border text-ink-faint"
                  }`}
                >
                  {u.isAdmin ? "Admin" : "Employee"}
                </span>
                <span className="text-sm text-ink-body">{format(new Date(u.createdAt), "d MMM yyyy")}</span>
                <button
                  onClick={() => toggleAdmin(u)}
                  className="w-fit rounded-full border-[1.5px] border-border-strong px-3 py-1 text-xs font-medium text-ink-body transition hover:border-indigo hover:text-indigo"
                >
                  {u.isAdmin ? "Remove admin" : "Make admin"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
