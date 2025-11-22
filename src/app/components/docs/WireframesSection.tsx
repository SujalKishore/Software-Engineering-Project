import React from "react";

const wireframes = [
  {
    title: "Dashboard Home",
    description:
      "High-level KPIs for production, scrap %, open orders, inventory health, and dispatch performance.",
    note: "Shows navigation to all five modules and key summary tiles.",
    imageUrl: "", // add `/wireframes/dashboard-home.png` later if you have
  },
  {
    title: "Daily Production Dashboard",
    description:
      "Line-wise and shift-wise production charts, trend over time, and detailed table with filters.",
    note: "Includes date, line, shift, and product filters.",
    imageUrl: "",
  },
  {
    title: "Scrap & Defects Dashboard",
    description:
      "Scrap % by line, top defects, Pareto chart, and drill-down into defect records.",
    note: "Helps identify root causes and problem lines.",
    imageUrl: "",
  },
  {
    title: "Customer Orders & Dispatch Dashboard",
    description:
      "Open orders, on-time delivery %, region-wise dispatch, and dispatch status.",
    note: "Highlights delayed or at-risk orders.",
    imageUrl: "",
  },
];

const WireframesSection: React.FC = () => {
  return (
    <section
      id="wireframes"
      className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <header>
          <h2 className="text-2xl font-semibold md:text-3xl">
            Wireframes & Mockups
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Wireframes define the layout of key dashboards before implementing
            them in tools like Power BI, Tableau, or Google Data Studio. These
            can be created in Figma, on paper, or directly using low-fidelity
            visuals in the BI tool.
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {wireframes.map((wf) => (
            <article
              key={wf.title}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-50">
                  {wf.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300">{wf.description}</p>
                <p className="mt-1 text-[11px] text-slate-400">{wf.note}</p>
              </div>

              {/* Placeholder for image (optional) */}
              {wf.imageUrl ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wf.imageUrl}
                    alt={wf.title}
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-3 flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900 text-[11px] text-slate-500">
                  Wireframe / mockup image placeholder
                </div>
              )}
            </article>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-slate-400">
          Tip: During viva, you can open this section and then switch to your
          actual Power BI/Tableau/Google Data Studio dashboards to show how the
          final implementation matches the initial wireframes.
        </p>
      </div>
    </section>
  );
};

export default WireframesSection;
