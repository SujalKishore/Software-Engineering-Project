import React from "react";

type ModuleInfo = {
  id: string;
  title: string;
  description: string;
  kpiExamples: string[];
};

const modules: ModuleInfo[] = [
  {
    id: "dailyProduction",
    title: "Daily Production",
    description:
      "Track units produced per line, shift, and product type. Compare current output against targets.",
    kpiExamples: ["Units per shift", "OEE%", "Downtime minutes"],
  },
  {
    id: "scrapPercentage",
    title: "Scrap Percentage",
    description:
      "Monitor scrap rates and defect types across lines to identify problem areas early.",
    kpiExamples: ["Scrap % by line", "Top 5 defects", "Rework count"],
  },
  {
    id: "customerOrders",
    title: "Customer Orders",
    description:
      "Visualize open orders, committed dates, and dispatch status to avoid delays and penalties.",
    kpiExamples: ["On-time delivery %", "Open orders", "Backlog quantity"],
  },
  {
    id: "inventoryLevels",
    title: "Inventory Levels",
    description:
      "Keep track of raw materials, WIP, and finished goods to balance stockouts vs. overstock.",
    kpiExamples: ["Days of inventory", "Fast/slow movers", "ABC categories"],
  },
  {
    id: "dispatch",
    title: "Dispatch",
    description:
      "Monitor dispatch performance by customer, region, and transporter to ensure smooth logistics.",
    kpiExamples: [
      "Dispatch cycle time",
      "Truck utilization",
      "Region-wise volume",
    ],
  },
];

const ModuleOverview: React.FC = () => {
  return (
    <section
      id="modules"
      className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Dashboard Modules
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-300">
              Each module gets its own dashboard page with charts, tables, and
              drill-down analysis. You can build these in{" "}
              <span className="font-semibold text-orange-300">
                Power BI / Tableau / Google Data Studio
              </span>
              .
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Tip: Use a shared navigation bar across all dashboards so users can
            switch modules quickly.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <article
              key={module.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:-translate-y-1 hover:border-orange-500/60 hover:bg-slate-900"
            >
              <div>
                <h3 className="text-base font-semibold text-slate-50">
                  {module.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  {module.description}
                </p>
              </div>

              <div className="mt-3 border-t border-slate-800 pt-3">
                <p className="text-[11px] font-medium text-slate-400">
                  Example KPIs
                </p>
                <ul className="mt-1 space-y-1 text-[11px] text-slate-200">
                  {module.kpiExamples.map((kpi) => (
                    <li
                      key={kpi}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      <span>{kpi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModuleOverview;
