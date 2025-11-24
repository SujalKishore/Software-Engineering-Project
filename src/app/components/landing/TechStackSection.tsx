import React from "react";
import AnimatedSection from "../ui/AnimatedSection";

const TechStackSection: React.FC = () => {
  return (
    <section className="border-y border-slate-900 bg-slate-950/50 py-12">
      <AnimatedSection className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">
              Powered by Modern Tech
            </h2>
            <p className="text-sm text-slate-400">
              Built for speed, scalability, and real-time insights.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-[#F2C811] flex items-center justify-center font-bold text-black text-xs">PBI</div>
              <span className="font-medium text-slate-300">Power BI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-[#E97627] flex items-center justify-center font-bold text-white text-xs">TAB</div>
              <span className="font-medium text-slate-300">Tableau</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-[#4285F4] flex items-center justify-center font-bold text-white text-xs">GDS</div>
              <span className="font-medium text-slate-300">Data Studio</span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-black border border-white/20 flex items-center justify-center font-bold text-white text-xs">N</div>
              <span className="font-medium text-slate-300">Next.js</span>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default TechStackSection;
