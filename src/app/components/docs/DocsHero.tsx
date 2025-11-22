import React from "react";

const DocsHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-18">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
          Project Documentation
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Brake Manufacturing Dashboard · Docs
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          Central place for the project&apos;s SRS summary, data model,
          wireframes, and tech stack. Use this page during{" "}
          <span className="font-semibold text-orange-200">
            viva / presentation
          </span>{" "}
          to walk evaluators through the system.
        </p>
      </div>
    </section>
  );
};

export default DocsHero;
