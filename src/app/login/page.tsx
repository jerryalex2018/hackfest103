"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, loginAsDemo, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login(email, password);
  }

  return (
    <section className="mx-auto max-w-md space-y-8 px-4 py-12 animate-fade-in">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-brand-green">Log in</h1>
        <p className="text-slate-600">Sign in to report degraded spots.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-brand-green/20 bg-brand-white p-8 shadow-sm"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-green px-6 py-3 font-semibold text-brand-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-brand-white px-3 text-xs uppercase tracking-wider text-slate-400">
            or instant test access
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => loginAsDemo("citizen")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-center"
          >
            👤 Demo Citizen
          </button>
          <button
            type="button"
            onClick={() => loginAsDemo("admin")}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-center"
          >
            🛡️ Demo Admin
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-blue hover:underline"
        >
          Sign up
        </Link>
      </p>
    </section>
  );
}
