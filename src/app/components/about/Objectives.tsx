import React from "react";

const objectives = [
  "Create a centralized dashboard system for real-time production monitoring.",
  "Visualize scrap percentage and defect causes to support quality improvement.",
  "Track customer orders, delivery performance, and delays.",
  "Provide accurate visibility into raw material, WIP, and finished goods inventory.",
  "Monitor dispatch efficiency and logistics analytics.",
  "Enable role-based access and secure data handling through authentication.",
  "Support interactive visual exploration using filters, slicers, and drill-downs.",
];

const Objectives: React.FC = () => {
  return (
    <section className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Project Objectives
        </h2>

        <ul className="mt-6 space-y-3 text-sm text-slate-300">
          {objectives.map((obj, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-400" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Objectives;
