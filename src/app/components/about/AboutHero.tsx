import React from "react";

const AboutHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-slate-900 to-slate-950" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          About the Project
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
          A centralized analytics platform for monitoring and improving
          manufacturing operations in the{" "}
          <span className="text-orange-300 font-semibold">
            brake shoes & brake pads production industry
          </span>
          .
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
