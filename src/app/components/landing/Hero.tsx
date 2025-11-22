"use client";

import React from "react";

type HeroProps = {
  onGetStartedClick?: () => void;
  onScrollToModules?: () => void;
};

const Hero: React.FC<HeroProps> = ({
  onGetStartedClick,
  onScrollToModules,
}) => {
  const tags = [
    "Daily Production",
    "Scrap %",
    "Customer Orders",
    "Inventory",
    "Dispatch & Logistics",
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-20">
        {/* Left side */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center rounded-full border border-orange-500/40 bg-slate-900/60 px-3 py-1 text-xs font-medium text-orange-300 backdrop-blur">
            Project 3 · Brake Shoes & Brake Pads Manufacturing Dashboard
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Centralized analytics for{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
              brake shoes & brake pads
            </span>{" "}
            manufacturing.
          </h1>

          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            Design and build an interactive dashboard to monitor{" "}
            <span className="font-semibold text-orange-200">
              daily production, scrap percentage, customer orders, inventory
              levels, and dispatch
            </span>{" "}
            using Power BI, Tableau, or Google Data Studio.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onGetStartedClick}
              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
            >
              View Dashboard Modules
            </button>

            <button
              onClick={onScrollToModules}
              className="text-sm font-medium text-slate-200 underline-offset-4 hover:text-orange-200 hover:underline"
            >
              Explore visualizations →
            </button>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] sm:text-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right side – mock dashboard card */}
        <div className="mt-8 flex-1 md:mt-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Production Overview</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                Real-time view
              </span>
            </div>

            {/* Fake charts & KPIs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[11px] text-slate-400">
                  Today&apos;s Output
                </p>
                <p className="mt-1 text-lg font-semibold text-orange-300">
                  4,250 units
                </p>
                <p className="text-[11px] text-emerald-400">
                  +6.2% vs yesterday
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-[11px] text-slate-400">Scrap Percentage</p>
                <p className="mt-1 text-lg font-semibold text-red-300">2.8%</p>
                <p className="text-[11px] text-slate-400">Target: &lt; 3.0%</p>
              </div>

              <div className="col-span-2 mt-2">
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hourly Production Trend</span>
                  <span>08:00 – 18:00</span>
                </div>

                {/* simple "chart" with bars */}
                <div className="flex items-end gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                  {[40, 60, 70, 90, 85, 75, 65, 55].map((h, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-t bg-gradient-to-t from-orange-500/40 via-orange-400/70 to-amber-200"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              Connected to ERP / production logs · Filter by line, shift, and
              product type.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
