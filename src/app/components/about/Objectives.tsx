"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Target, BarChart2, Truck, Layers, ShieldCheck } from "lucide-react";

const objectives = [
  {
    title: "Real-time Monitoring",
    description: "Centralized dashboard for instant production visibility across all lines.",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    border: "group-hover:border-blue-500/50",
  },
  {
    title: "Quality Control",
    description: "Visualize scrap rates and defect causes to drive continuous improvement.",
    icon: ShieldCheck,
    color: "from-red-500 to-pink-500",
    shadow: "shadow-red-500/20",
    border: "group-hover:border-red-500/50",
  },
  {
    title: "Inventory Optimization",
    description: "Track raw materials and finished goods to prevent stockouts and overstocking.",
    icon: Layers,
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
    border: "group-hover:border-emerald-500/50",
  },
  {
    title: "Logistics & Dispatch",
    description: "Monitor delivery performance and optimize route efficiency for timely shipments.",
    icon: Truck,
    color: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-500/20",
    border: "group-hover:border-orange-500/50",
  },
  {
    title: "Interactive Analytics",
    description: "Drill-down capabilities for deep data exploration and actionable insights.",
    icon: BarChart2,
    color: "from-purple-500 to-indigo-500",
    shadow: "shadow-purple-500/20",
    border: "group-hover:border-purple-500/50",
  },
];

const Objectives: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="bg-slate-950 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">
            Core Objectives
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Strategic goals driving our manufacturing excellence.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:h-[500px]">
          {objectives.map((obj, index) => (
            <motion.div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              animate={{
                flex: hoveredIndex === index ? 3 : 1,
                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1,
              }}
              className={`group relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-8 transition-all duration-500 ${obj.border} hover:shadow-2xl ${obj.shadow}`}
            >
              {/* Icon */}
              <div className={`mb-auto w-fit rounded-2xl bg-gradient-to-br ${obj.color} p-4 text-white shadow-lg`}>
                <obj.icon size={28} />
              </div>

              <motion.div
                layout
                className="relative z-10"
              >
                <h3 className="whitespace-nowrap text-2xl font-bold text-slate-50">
                  {obj.title}
                </h3>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    height: hoveredIndex === index ? "auto" : 0,
                    marginTop: hoveredIndex === index ? 16 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="text-base text-slate-300 leading-relaxed max-w-md">
                    {obj.description}
                  </p>
                </motion.div>
              </motion.div>

              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-b ${obj.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`} />

              {/* Subtle Grid Pattern Overlay */}
              <div className="absolute inset-0 -z-20 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Objectives;
