import React from "react";

const steps = [
  {
    title: "1. Define KPIs",
    details:
      "Finalize metrics for daily production, scrap %, orders, inventory, and dispatch with the faculty/industry mentor.",
  },
  {
    title: "2. Design Data Model",
    details:
      "Identify tables, relationships, and grain of data (per shift, per day, per line, etc.).",
  },
  {
    title: "3. Build Dashboards",
    details:
      "Create pages for each module with charts, tables, cards, and drill-downs in Power BI/Tableau/Data Studio.",
  },
  {
    title: "4. Add Interactivity",
    details:
      "Add filters, slicers, and navigation buttons so users can explore the data intuitively.",
  },
  {
    title: "5. Test with Users",
    details:
      "Share with supervisors or sample users to get feedback and refine visual design.",
  },
];

const ProjectFlowSection: React.FC = () => {
  return (
    <section
      id="flow"
      className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Project Flow
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Use this high-level flow as your guideline while building wireframes,
          mockups, and final dashboards.
        </p>

        <ol className="mt-6 space-y-4 text-xs text-slate-200">
          {steps.map((step, idx) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-orange-500 text-center text-[11px] font-semibold text-slate-950">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-slate-300">{step.details}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default ProjectFlowSection;
