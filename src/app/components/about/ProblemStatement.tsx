import React from "react";

const ProblemStatement: React.FC = () => {
  return (
    <section className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Problem Statement
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed">
          The manufacturing process of brake shoes and brake pads involves
          multiple stages such as raw material sourcing, production operations,
          quality checks, inventory handling, and dispatch logistics. Currently,
          many plants rely heavily on manual record-keeping and scattered data
          sources such as Excel sheets, handwritten reports, and disconnected
          ERP logs.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed">
          This results in challenges like delayed decision-making, difficulty in
          tracking real-time production performance, lack of visibility into
          scrap and defect trends, inefficient inventory management, and poor
          order fulfillment planning. Without consolidated analytics,
          manufacturers struggle to optimize productivity and reduce losses.
        </p>
      </div>
    </section>
  );
};

export default ProblemStatement;
