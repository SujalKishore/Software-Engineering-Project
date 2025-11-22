"use client";

import React from "react";

interface QuickAccessModulesProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const modules = [
  {
    name: "Overview",
    view: "Overview",
    short: "Overview",
  },
  {
    name: "Daily Production",
    view: "DailyProduction",
    short: "Production",
  },
  {
    name: "Scrap & Quality",
    view: "Scrap",
    short: "Scrap",
  },
  {
    name: "Customer Orders",
    view: "Orders",
    short: "Orders",
  },
  {
    name: "Inventory",
    view: "Inventory",
    short: "Inventory",
  },
  {
    name: "Dispatch & Logistics",
    view: "Dispatch",
    short: "Dispatch",
  },
];

const QuickAccessModules: React.FC<QuickAccessModulesProps> = ({
  activeView,
  onNavigate,
}) => {
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Quick Access Modules
        </p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {modules.map((mod) => (
            <button
              key={mod.name}
              onClick={() => onNavigate(mod.view)}
              className={`rounded-full border px-3 py-1.5 font-medium transition ${activeView === mod.view
                ? "border-orange-500 text-orange-300 bg-slate-900"
                : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-orange-500 hover:text-orange-300 hover:bg-slate-900"
                }`}
            >
              {mod.short} →
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessModules;
