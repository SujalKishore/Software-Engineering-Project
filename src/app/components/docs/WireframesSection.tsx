"use client";
import React from "react";
import AnimatedSection from "../ui/AnimatedSection";
import { motion } from "framer-motion";

const wireframes = [
  {
    title: "Executive Dashboard",
    desc: "High-level KPIs for plant managers.",
    color: "bg-blue-500",
  },
  {
    title: "Production Line View",
    desc: "Detailed hourly output tracking.",
    color: "bg-orange-500",
  },
  {
    title: "Scrap Analysis",
    desc: "Pareto charts for defect root causes.",
    color: "bg-red-500",
  },
];

const WireframesSection: React.FC = () => {
  return (
    <section className="bg-slate-950 px-4 py-24">
      <AnimatedSection className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-50">UI Wireframes</h2>
          <p className="mt-2 text-slate-400">Early design concepts and layouts</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {wireframes.map((wf, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
                z: 50
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="group relative aspect-[4/3] cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl transition-all"
            >
              {/* Mock UI Header */}
              <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="mx-auto h-2 w-32 rounded-full bg-slate-800" />
              </div>

              {/* Mock UI Body */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-20 w-1/3 rounded-lg bg-slate-800/50" />
                  <div className="h-20 w-1/3 rounded-lg bg-slate-800/50" />
                  <div className="h-20 w-1/3 rounded-lg bg-slate-800/50" />
                </div>
                <div className="flex gap-3">
                  <div className="h-32 w-2/3 rounded-lg bg-slate-800/50" />
                  <div className="h-32 w-1/3 rounded-lg bg-slate-800/50" />
                </div>
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <div className={`mb-2 h-12 w-12 rounded-full ${wf.color} opacity-80 blur-xl`} />
                <h3 className="relative z-10 text-xl font-bold text-white">{wf.title}</h3>
                <p className="relative z-10 text-sm text-slate-300">{wf.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
};

export default WireframesSection;
