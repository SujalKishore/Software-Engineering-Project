"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";

export default function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // frontend only – no real registration yet
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-stretch">
          {/* Left side – explanation */}
          <div className="flex-1 space-y-4 md:space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
              Project 3 · Brake Dashboard
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
              Create your project account
            </h1>
            <p className="max-w-md text-sm text-slate-300">
              Set up an account to explore brake shoes & brake pads
              manufacturing analytics: from production lines to dispatch
              performance.
            </p>

            <div className="mt-4 grid gap-3 text-[11px] text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="font-semibold text-slate-100">
                  Unified view of operations
                </p>
                <p className="mt-1 text-slate-400">
                  One dashboard for production, scrap, orders, inventory, and
                  logistics – all connected.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="font-semibold text-slate-100">
                  Built for analytics
                </p>
                <p className="mt-1 text-slate-400">
                  Designed to pair with Power BI / Tableau / Google Data Studio
                  for interactive insights.
                </p>
              </div>
            </div>
          </div>

          {/* Right side – register card */}
          <div className="flex-1">
            <div className="relative mx-auto max-w-sm rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/40">
              {/* glow */}
              <div className="pointer-events-none absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950 blur-xl" />

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-50">
                    Register
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Create an account to access the dashboards.
                  </p>
                </div>

                {/* mini badge */}
                <div className="rounded-full border border-orange-500/60 bg-slate-900/80 px-3 py-1 text-[10px] font-semibold text-orange-300">
                  New user
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-200">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-200">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-orange-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-orange-500/30 transition hover:bg-orange-400"
                >
                  Create account
                </button>
              </form>

              <div className="mt-4 space-y-2 text-[11px] text-slate-400">
                <p className="text-center">
                  Already registered?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-orange-300 hover:text-orange-200"
                  >
                    Login
                  </Link>
                </p>
                <p className="rounded-md border border-dashed border-slate-700 bg-slate-900/60 px-3 py-2 text-[10px] text-slate-400">
                  This is a front-end-only registration screen. Hook it to your
                  chosen authentication backend in the implementation phase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
