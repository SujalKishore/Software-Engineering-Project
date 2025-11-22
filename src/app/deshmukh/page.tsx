// D:/se/src/app/deshmukh/page.tsx
"use client";

import Link from "next/link";
import React, { useMemo } from "react";

/**
 * Modern, sleek, fully-animated landing page for:
 * "Real-time Monitoring of Critical Production Machine's Spare Parts and Production Process Consumables"
 *
 * - Tailwind CSS utilities + a few component-scoped keyframes for smooth micro-animations.
 * - Uses modern "glass" surfaces, gradients, subtle depth, hover/focus motion, and staged entrance animations.
 * - Compatible with Next.js App Router (no inner <a> inside <Link>).
 *
 * Drop this file into your app route (replace existing page.tsx).
 * Make sure Tailwind is configured and loaded globally in your project.
 */

type KPI = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  status?: "ok" | "warning" | "critical";
};

const KPIS: KPI[] = [
  {
    id: "k1",
    label: "Parts below reorder",
    value: "5",
    delta: "-40%",
    status: "critical",
  },
  {
    id: "k2",
    label: "Avg cons/hr",
    value: "12.3",
    delta: "+3%",
    status: "warning",
  },
  {
    id: "k3",
    label: "Machines online",
    value: "18 / 20",
    delta: "-2",
    status: "warning",
  },
  {
    id: "k4",
    label: "Downtime today",
    value: "00:42",
    delta: "+10%",
    status: "critical",
  },
];

const Icon = ({ name }: { name: string }) => {
  const common = "h-5 w-5 stroke-2";
  switch (name) {
    case "parts":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z"
          />
        </svg>
      );
    case "consumption":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12h3l3 8 4-16 4 8 3-4h2"
          />
        </svg>
      );
    default:
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
          <circle
            cx="12"
            cy="12"
            r="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
};

const statusClasses = (s?: KPI["status"]) =>
  s === "ok"
    ? "bg-emerald-100 text-emerald-700"
    : s === "warning"
    ? "bg-amber-100 text-amber-800"
    : "bg-rose-100 text-rose-700";

export default function LandingPage() {
  // subtle ordering for animation delays
  const stages = useMemo(() => [0, 80, 160, 240], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black antialiased text-slate-100">
      {/* decorative blurred gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-32 aspect-[3/2] w-[60rem] rounded-full bg-gradient-to-tr from-[#0ea5e9]/20 to-[#7c3aed]/10 blur-3xl opacity-60 animate-blob" />
        <div className="absolute -right-24 -bottom-32 aspect-[3/2] w-[48rem] rounded-full bg-gradient-to-bl from-[#06b6d4]/10 to-[#f97316]/10 blur-2xl opacity-50 animate-blob animation-delay-4000" />
      </div>

      <header className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-700/40 px-4 py-2 backdrop-blur-sm shadow-md">
              <div className="rounded-md bg-gradient-to-tr from-sky-500 to-indigo-500 p-2 text-black font-semibold">
                FI
              </div>
              <div>
                <div className="text-sm font-semibold leading-none">
                  FactoryInsight
                </div>
                <div className="text-xs text-slate-400">Realtime Ops</div>
              </div>
            </div>

            <nav className="hidden md:flex gap-3 text-sm text-slate-300">
              <a
                href="#modules"
                className="transform-gpu transition hover:-translate-y-0.5 hover:text-white"
              >
                Modules
              </a>
              <a
                href="#visualizations"
                className="transform-gpu transition hover:-translate-y-0.5 hover:text-white"
              >
                Visualizations
              </a>
              <a
                href="#alerts"
                className="transform-gpu transition hover:-translate-y-0.5 hover:text-white"
              >
                Alerts
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/mnt/data/next-handbook.pdf"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-700/60 px-3 py-1 text-sm text-slate-200/90 backdrop-blur hover:scale-105 transform transition"
            >
              Design notes
            </a>
            <button className="rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 px-3 py-1 text-sm font-semibold text-black shadow hover:scale-105 transform transition">
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16">
        {/* Hero */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/50 p-6 backdrop-blur border border-slate-700/40 shadow-xl">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    Real-time Monitoring • Spare Parts & Consumables
                  </h1>
                  <p className="mt-2 text-slate-300/90 max-w-2xl">
                    Sleek centralized dashboard to monitor spare-parts
                    inventory, consumption trends, and machine performance. Set
                    alerts, visualize live metrics, and reduce downtime.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="#visualizations"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-black shadow hover:scale-105 transform transition"
                    >
                      View visualizations
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 12h14M12 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      href="#alerts"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700/40 px-4 py-2 text-sm text-slate-200 backdrop-blur hover:bg-slate-800/50 transform transition"
                    >
                      Alerts & notifications
                    </Link>
                  </div>
                </div>

                {/* live mini-kpi group */}
                <div className="hidden lg:flex shrink-0 flex-col gap-3">
                  {KPIS.map((kpi, i) => (
                    <div
                      key={kpi.id}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className="w-60 rounded-xl bg-gradient-to-br from-white/3 to-white/2 border border-white/6 p-3 backdrop-blur-sm shadow-md transform-gpu transition hover:scale-105 motion-reduce:transform-none animate-fadeInUp"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-300">
                            {kpi.label}
                          </div>
                          <div className="mt-1 text-lg font-semibold">
                            {kpi.value}
                          </div>
                        </div>
                        <div
                          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${statusClasses(
                            kpi.status
                          )}`}
                        >
                          {kpi.status === "critical"
                            ? "Critical"
                            : kpi.status === "warning"
                            ? "Warn"
                            : "OK"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* animated separator */}
            <div className="mt-6 h-1 w-full overflow-hidden">
              <div className="h-full w-[140%] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent opacity-60 animate-scroll" />
            </div>
          </div>

          {/* KPI cards on right (mobile stacked below) */}
          <aside className="flex flex-col gap-4">
            {KPIS.slice(0, 3).map((k, idx) => (
              <div
                key={k.id}
                style={{ animationDelay: `${stages[idx]}ms` }}
                className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/40 p-4 backdrop-blur shadow-lg transform-gpu transition hover:-translate-y-1 hover:scale-102 animate-fadeInUp"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-400">{k.label}</div>
                    <div className="mt-1 text-2xl font-semibold">{k.value}</div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${statusClasses(
                      k.status
                    )}`}
                  >
                    {k.delta}
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </section>

        {/* Modules */}
        <section id="modules" className="mb-10">
          <h2 className="mb-3 text-xl font-bold">Modules</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ModuleCard
              title="Spare Parts Inventory"
              href="/spare-parts"
              description="Track stock, reorder points, suppliers and ETA — with auto re-order rules."
              icon={<Icon name="parts" />}
              delay={0}
            />
            <ModuleCard
              title="Consumption Rates"
              href="/consumption"
              description="Per-machine & per-shift consumable trends, forecasting and variance detection."
              icon={<Icon name="consumption" />}
              delay={80}
            />
            <ModuleCard
              title="Machine Performance"
              href="/machines"
              description="Uptime, cycle-time, error heatmaps and OEE dashboards for every cell."
              icon={<Icon name="performance" />}
              delay={160}
            />
          </div>
        </section>

        {/* Visualizations */}
        <section id="visualizations" className="mb-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/50 p-6 backdrop-blur border border-slate-700/40 shadow-xl animate-fadeInUp">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Consumption — Last 30 days
                </h3>
                <div className="text-sm text-slate-400">
                  Live • Updated 45s ago
                </div>
              </div>

              <div className="mt-4 h-64 w-full rounded-xl border border-dashed border-slate-700/30 bg-gradient-to-b from-white/2 to-transparent grid place-items-center">
                {/* Replace placeholder with Chart.js / Recharts / embedded PowerBI */}
                <div className="text-slate-300/60">
                  [Time-series visualization placeholder — embed your BI here]
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="rounded-full border border-slate-700/40 px-3 py-1 text-sm">
                  Export CSV
                </button>
                <button className="rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 px-3 py-1 text-sm font-semibold text-black">
                  Open in Power BI
                </button>
              </div>
            </div>

            <aside className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/40 p-4 backdrop-blur border border-slate-700/40 shadow-xl animate-fadeInUp">
              <h4 className="text-sm font-semibold">Machine Health</h4>

              <div className="mt-3 grid gap-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/30 p-3">
                  <div>
                    <div className="text-xs text-slate-400">Avg OEE</div>
                    <div className="mt-1 text-lg font-semibold">82%</div>
                  </div>
                  <div className="w-24 text-right text-xs text-slate-400">
                    Gauge →
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/30 p-3">
                  <div>
                    <div className="text-xs text-slate-400">
                      Critical Alerts
                    </div>
                    <div className="mt-1 text-lg font-semibold text-rose-400">
                      3
                    </div>
                  </div>
                  <div className="w-24 text-right text-xs text-slate-400">
                    List →
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Alerts */}
        <section id="alerts" className="mb-10">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/40 p-6 backdrop-blur shadow-xl animate-fadeInUp">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Alerts & Notifications
                </h3>
                <p className="mt-1 text-sm text-slate-300/80">
                  Configure thresholds, channels (Email, SMS, Slack) and
                  escalation policies.
                </p>
              </div>

              <div className="flex gap-3">
                <button className="rounded-full border border-slate-700/30 px-3 py-1 text-sm">
                  Edit rules
                </button>
                <button className="rounded-full bg-rose-500 px-3 py-1 text-sm font-semibold text-black">
                  Test alert
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <AlertCard
                title="Low Inventory"
                desc="Notify when part reaches reorder point."
                tag="Auto reorder"
              />
              <AlertCard
                title="Machine Downtime"
                desc="Trigger when downtime > 10 minutes."
                tag="Critical"
                tone="warning"
              />
              <AlertCard
                title="Critical Events"
                desc="SMS + Email routing for critical alerts."
                tag="SMS + Email"
                tone="critical"
              />
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-semibold text-slate-300">
                Recent Alerts
              </h5>
              <ul className="mt-3 divide-y divide-slate-700/30">
                <li className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      Spare part: Motor_Bearing low
                    </div>
                    <div className="text-xs text-slate-400">
                      Triggered 12:04 • Threshold 10 units
                    </div>
                  </div>
                  <div className="text-sm text-rose-400">Pending</div>
                </li>
                <li className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Machine A12 downtime</div>
                    <div className="text-xs text-slate-400">
                      Triggered 11:40 • Duration 18m
                    </div>
                  </div>
                  <div className="text-sm text-amber-400">Acknowledged</div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/30 p-6 backdrop-blur shadow-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">Integrations</div>
              <div className="text-sm text-slate-400">
                Power BI • Tableau • Google Data Studio • OPC UA • MQTT • ERP
              </div>
            </div>

            <div className="flex gap-3">
              <button className="rounded-full border border-slate-700/30 px-3 py-1 text-sm">
                Connect Power BI
              </button>
              <button className="rounded-full border border-slate-700/30 px-3 py-1 text-sm">
                Connect MQTT
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* component-scoped keyframes + utility classes */}
      <style jsx>{`
        :global(.animate-blob) {
          animation: blob 12s infinite;
        }
        :global(.animation-delay-4000) {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.85;
          }
          33% {
            transform: translateY(-20px) scale(1.06);
            opacity: 0.95;
          }
          66% {
            transform: translateY(8px) scale(0.98);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.85;
          }
        }

        :global(.animate-fadeInUp) {
          animation: fadeInUp 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.998);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        :global(.animate-scroll) {
          animation: scroll 9s linear infinite;
        }
        @keyframes scroll {
          from {
            transform: translateX(-20%);
          }
          to {
            transform: translateX(-80%);
          }
        }

        /* subtle scale helper */
        :global(.scale-102) {
          transform: scale(1.02);
        }

        /* motion-reduce respects user prefs */
        @media (prefers-reduced-motion: reduce) {
          :global(.animate-blob),
          :global(.animate-fadeInUp),
          :global(.animate-scroll) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ----- Small subcomponents ----- */

function ModuleCard({
  title,
  description,
  href,
  icon,
  delay = 0,
}: {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  delay?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-800/40 to-transparent p-4 backdrop-blur-sm shadow-lg transform-gpu transition hover:-translate-y-1 hover:scale-102"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-black shadow-md">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white">
            {title}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rotate-45 rounded-lg bg-gradient-to-br from-white/6 to-transparent opacity-20 blur-md" />
      <div className="mt-4 text-xs text-slate-400">Open module →</div>
    </Link>
  );
}

function AlertCard({
  title,
  desc,
  tag,
  tone = "ok",
}: {
  title: string;
  desc: string;
  tag?: string;
  tone?: "ok" | "warning" | "critical";
}) {
  const toneClass =
    tone === "critical"
      ? "from-rose-500 to-rose-400"
      : tone === "warning"
      ? "from-amber-400 to-amber-300"
      : "from-emerald-400 to-emerald-300";
  return (
    <div className="rounded-xl border border-slate-700/30 p-4 bg-gradient-to-br from-slate-800/30 to-transparent backdrop-blur-sm shadow inner">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <div className="mt-1 text-xs text-slate-400">{desc}</div>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium bg-clip-padding bg-gradient-to-br ${toneClass} text-black`}
        >
          {tag}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button className="rounded-full border border-slate-700/30 px-3 py-1 text-xs">
          Edit
        </button>
        <button className="rounded-full bg-slate-700/20 px-3 py-1 text-xs">
          Test
        </button>
      </div>
    </div>
  );
}
