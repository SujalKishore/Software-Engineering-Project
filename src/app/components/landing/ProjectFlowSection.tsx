import React from "react";
import AnimatedSection from "../ui/AnimatedSection";

const steps = [
  {
    title: "Define KPIs",
    details: "Collaborate with industry mentors to finalize metrics for production, scrap, and inventory.",
    icon: "1",
  },
  {
    title: "Design Data Model",
    details: "Structure tables and relationships (Star Schema) to ensure accurate reporting grain.",
    icon: "2",
  },
  {
    title: "Build Dashboards",
    details: "Develop interactive views in Power BI/Tableau with drill-downs and tooltips.",
    icon: "3",
  },
  {
    title: "Add Interactivity",
    details: "Implement slicers, filters, and navigation for a seamless user experience.",
    icon: "4",
  },
  {
    title: "User Testing",
    details: "Validate with supervisors, gather feedback, and refine the visual design.",
    icon: "5",
  },
];

const ProjectFlowSection: React.FC = () => {
  return (
    <section id="flow" className="bg-slate-950 px-6 py-24">
      <AnimatedSection className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Implementation Roadmap
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            From raw data to actionable insights: our step-by-step process.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 h-full w-px bg-slate-800 md:left-1/2" />

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className={`relative flex flex-col gap-8 md:flex-row ${idx % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-950 bg-orange-500 text-xs font-bold text-white md:left-1/2">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="ml-16 md:ml-0 md:w-1/2 md:px-8">
                  <div className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-orange-500/30 ${idx % 2 === 0 ? "md:text-right" : "md:text-left"
                    }`}>
                    <h3 className="text-xl font-semibold text-slate-50">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-slate-400">{step.details}</p>
                  </div>
                </div>

                {/* Empty space for the other side */}
                <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default ProjectFlowSection;
