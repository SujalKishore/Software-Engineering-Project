"use client";
import React from "react";
import AnimatedSection from "../ui/AnimatedSection";
import { motion } from "framer-motion";

const techs = [
  { name: "Next.js", x: 50, y: 20, color: "bg-white" },
  { name: "TypeScript", x: 20, y: 50, color: "bg-blue-500" },
  { name: "Tailwind", x: 80, y: 50, color: "bg-cyan-400" },
  { name: "Prisma", x: 35, y: 80, color: "bg-emerald-500" },
  { name: "PostgreSQL", x: 65, y: 80, color: "bg-blue-300" },
];

const DocsTechStackSection: React.FC = () => {
  return (
    <section className="bg-slate-950 px-4 py-24">
      <AnimatedSection className="mx-auto max-w-4xl text-center">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-50">Technology Stack</h2>
          <p className="mt-2 text-slate-400">The modern tools powering our platform</p>
        </div>

        <div className="relative mx-auto h-[400px] w-full max-w-[600px] rounded-full bg-slate-900/30 border border-slate-800">
          {/* Connecting Lines */}
          <svg className="absolute inset-0 h-full w-full">
            <line x1="50%" y1="20%" x2="20%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <line x1="50%" y1="20%" x2="80%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <line x1="20%" y1="50%" x2="35%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <line x1="80%" y1="50%" x2="65%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <line x1="35%" y1="80%" x2="65%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          </svg>

          {/* Nodes */}
          {techs.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.2 }}
              className="absolute flex flex-col items-center gap-2"
              style={{ left: `${tech.x}%`, top: `${tech.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className={`h-12 w-12 rounded-full ${tech.color} shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center text-slate-950 font-bold text-xs`}>
                {tech.name.slice(0, 2)}
              </div>
              <span className="rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
};

export default DocsTechStackSection;
