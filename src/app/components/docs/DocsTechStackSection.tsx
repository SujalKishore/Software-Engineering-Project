import React from "react";

const DocsTechStackSection: React.FC = () => {
  return (
    <section
      id="tech-stack"
      className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h2 className="text-2xl font-semibold md:text-3xl">Tech Stack</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            The project combines a modern web front-end with industry-standard
            BI tools to deliver rich analytics dashboards.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Web app stack */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Web Application (Frontend)
            </h3>
            <ul className="mt-3 space-y-1 text-xs text-slate-300">
              <li>
                • <span className="font-semibold text-orange-300">Next.js</span>{" "}
                – React-based framework for routing, layouts, and server/client
                components.
              </li>
              <li>
                •{" "}
                <span className="font-semibold text-orange-300">
                  TypeScript
                </span>{" "}
                – Adds type safety and maintainability.
              </li>
              <li>
                •{" "}
                <span className="font-semibold text-orange-300">
                  Tailwind CSS
                </span>{" "}
                – Utility-first styling for fast, consistent UI.
              </li>
              <li>
                • Authentication UI – Login, registration, and role-based views.
              </li>
            </ul>
          </div>

          {/* BI tools stack */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Analytics & Dashboards (BI Layer)
            </h3>
            <ul className="mt-3 space-y-1 text-xs text-slate-300">
              <li>
                •{" "}
                <span className="font-semibold text-orange-300">Power BI</span>{" "}
                – DAX measures, interactive reports, and published dashboards.
              </li>
              <li>
                • <span className="font-semibold text-orange-300">Tableau</span>{" "}
                – Alternative for advanced visualization and storytelling.
              </li>
              <li>
                •{" "}
                <span className="font-semibold text-orange-300">
                  Google Data Studio
                </span>{" "}
                – Option for web-based, shareable reports.
              </li>
              <li>
                • Data is sourced from CSV/Excel exports of ERP / production
                logs.
              </li>
            </ul>
          </div>
        </div>

        <div className="grid gap-5 text-xs text-slate-300 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Architecture (High-level)
            </h3>
            <ul className="mt-2 space-y-1">
              <li>• Users access the Next.js web app via browser.</li>
              <li>• Web app links to or embeds dashboards from BI tools.</li>
              <li>
                • BI tools connect to structured datasets (Production, Scrap,
                etc.).
              </li>
              <li>
                • Admin periodically uploads/refreshes data from ERP exports.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-slate-50">
              Possible Extensions
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                • Connect directly to a production database (SQL Server, etc.).
              </li>
              <li>
                • Implement real-time streaming data (IoT sensors, machine
                data).
              </li>
              <li>
                • Add alerting for high scrap %, low inventory, delayed orders.
              </li>
              <li>• Integrate role-based access with organization SSO.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocsTechStackSection;
