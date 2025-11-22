import React from "react";

const SrsSummarySection: React.FC = () => {
  return (
    <section
      id="srs-summary"
      className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h2 className="text-2xl font-semibold md:text-3xl">SRS Summary</h2>
          <p className="mt-2 text-sm text-slate-300 max-w-2xl">
            This section summarizes the Software Requirements Specification for
            the Brake Shoes & Brake Pads Manufacturing Analytics Dashboard.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-300">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">
              System Overview
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              The system is a web-based dashboard platform that consolidates
              data from production, quality (scrap), customer orders, inventory,
              and dispatch. Users can log in with role-based access and analyze
              performance using interactive visualizations.
            </p>

            <h3 className="mt-4 text-sm font-semibold text-slate-100">
              Users & Roles
            </h3>
            <ul className="mt-1 space-y-1 text-xs text-slate-300">
              <li>
                • Operator / Supervisor – view dashboards relevant to their
                line/shift.
              </li>
              <li>
                • Manager – view plant-wide KPIs and trends, compare lines and
                customers.
              </li>
              <li>
                • Admin – manage users, upload data, configure master data /
                thresholds.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">
              High-Level Functional Requirements
            </h3>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>
                • User authentication (login/register) and role-based access
                control.
              </li>
              <li>
                • Dashboards for daily production, scrap %, customer orders,
                inventory, dispatch.
              </li>
              <li>• Filters, slicers, and drill-down into detail records.</li>
              <li>• Upload/import of datasets (e.g., CSV/Excel from ERP).</li>
              <li>• Basic admin panel for user and master data management.</li>
            </ul>

            <h3 className="mt-4 text-sm font-semibold text-slate-100">
              Non-Functional Requirements
            </h3>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>
                • Usability: clean, intuitive dashboard UI for non-technical
                users.
              </li>
              <li>
                • Performance: quick loading of dashboards for typical data
                sizes.
              </li>
              <li>
                • Security: authenticated access and restricted admin
                operations.
              </li>
              <li>
                • Portability: web-based solution accessible via modern
                browsers.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SrsSummarySection;
