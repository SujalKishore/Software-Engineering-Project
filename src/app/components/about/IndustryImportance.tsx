import React from "react";

const IndustryImportance: React.FC = () => {
  return (
    <section className="bg-slate-950 px-4 py-12 text-slate-50 md:py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h2 className="text-2xl font-semibold md:text-3xl">
          Brake Shoes & Brake Pads Manufacturing & Why Analytics Matter
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed">
          Brake shoes and brake pads are critical safety components used in
          automotive vehicles. Their production requires precision, strict
          quality control, and consistent output to meet industry standards and
          customer expectations. Any defects or delays may lead to serious
          performance failures or supply chain issues.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed">
          Implementing modern analytics in manufacturing enables smarter
          decision-making by offering real-time visibility, predicting
          inefficiencies, reducing scrap and rework, optimizing inventory
          levels, supporting accurate forecasting, and improving dispatch
          performance. A centralized dashboard transforms raw data into valuable
          insights that directly contribute to productivity, profitability, and
          product safety.
        </p>
      </div>
    </section>
  );
};

export default IndustryImportance;
