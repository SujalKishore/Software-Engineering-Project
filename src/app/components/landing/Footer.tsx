import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 text-slate-300">
      {/* Top section */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand / Project */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-50">
              Brake Shoes & Brake Pads Manufacturing
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Centralized analytics for daily production, scrap percentage,
              customer orders, inventory levels, and dispatch performance.
            </p>
            <span className="inline-flex items-center rounded-full border border-orange-500/40 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-orange-300">
              Project 3 · Dashboard Design
            </span>
          </div>

          {/* Modules */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-50">
              Dashboard Modules
            </h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• Daily Production</li>
              <li>• Scrap Percentage</li>
              <li>• Customer Orders</li>
              <li>• Inventory Levels</li>
              <li>• Dispatch & Logistics</li>
            </ul>
          </div>

          {/* Tools / Interactivity */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-50">
              Visualization & Tools
            </h4>
            <p className="text-xs text-slate-400">
              Built using:
              <br />
              <span className="font-medium text-slate-200">
                Power BI · Tableau · Google Data Studio
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Features:
              <br />
              Filters & slicers · Drill-down · KPI cards · Interactive charts
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Brake Manufacturing Analytics ·
            Academic Project.
          </p>
          <p className="text-[11px]">
            Dashboard wireframes & mockups · For internal / educational use
            only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
