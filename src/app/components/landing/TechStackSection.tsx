import React from "react";

const tools = [
  {
    name: "Power BI",
    use: "Rich visuals, DAX for measures, Row-level security.",
  },
  {
    name: "Tableau",
    use: "Interactive dashboards, story points, strong drag-and-drop.",
  },
  {
    name: "Google Data Studio",
    use: "Free, easy sharing via links, integrates with Google Sheets.",
  },
];

const TechStackSection: React.FC = () => {
  return (
    <section className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Visualization & Tech Stack
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Choose any of the following tools to build your dashboards. The data
          model remains the same; only the visualization layer changes.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="mb-2 text-sm font-semibold text-orange-300">
                {tool.name}
              </div>
              <p className="text-xs text-slate-200">{tool.use}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 text-xs text-slate-200 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Data Sources
            </h3>
            <ul className="mt-2 space-y-1">
              <li>• ERP exports (CSV/Excel)</li>
              <li>• Production logs (shift-wise)</li>
              <li>• Inventory / stores data</li>
              <li>• Dispatch registers / transport data</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Interactivity to implement
            </h3>
            <ul className="mt-2 space-y-1">
              <li>• Filters for date, line, product, and customer</li>
              <li>• Slicers for region, shift, and transporter</li>
              <li>• Drill-down from summary KPIs → detail tables</li>
              <li>• Tooltips with extra information on hover</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
