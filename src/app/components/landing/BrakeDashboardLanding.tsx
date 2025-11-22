"use client";

import React, { useRef } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ModuleOverview from "./ModuleOverview";
import TechStackSection from "./TechStackSection";
import ProjectFlowSection from "./ProjectFlowSection";
import Footer from "./Footer";

const BrakeDashboardLanding: React.FC = () => {
  const modulesRef = useRef<HTMLElement | null>(null);

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar onScrollToModules={scrollToModules} />

      <main>
        <Hero
          onGetStartedClick={scrollToModules}
          onScrollToModules={scrollToModules}
        />

        <section ref={modulesRef as any}>
          <ModuleOverview />
        </section>

        <TechStackSection />

        <ProjectFlowSection />
      </main>

      <Footer />
    </div>
  );
};

export default BrakeDashboardLanding;
