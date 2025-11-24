"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle } from "lucide-react";

const ProblemStatement: React.FC = () => {
  const [hovered, setHovered] = useState<"before" | "after" | null>(null);

  return (
    <section className="bg-slate-950 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">
            The Transformation
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Moving from chaos to clarity.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Before Card */}
          <motion.div
            onMouseEnter={() => setHovered("before")}
            onMouseLeave={() => setHovered(null)}
            animate={{
              scale: hovered === "before" ? 1.02 : hovered === "after" ? 0.98 : 1,
              opacity: hovered === "after" ? 0.5 : 1,
            }}
            className="group relative overflow-hidden rounded-3xl border border-red-900/30 bg-red-950/10 p-8 transition-colors hover:bg-red-950/20"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-full bg-red-500/20 p-3 text-red-500">
                <XCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-red-200">The Problem</h3>
            </div>
            <ul className="space-y-4 text-red-200/70">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Scattered data across Excel sheets and paper logs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Delayed visibility into production bottlenecks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>High scrap rates due to reactive quality control.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Inefficient inventory planning and stockouts.</span>
              </li>
            </ul>
          </motion.div>

          {/* After Card */}
          <motion.div
            onMouseEnter={() => setHovered("after")}
            onMouseLeave={() => setHovered(null)}
            animate={{
              scale: hovered === "after" ? 1.02 : hovered === "before" ? 0.98 : 1,
              opacity: hovered === "before" ? 0.5 : 1,
            }}
            className="group relative overflow-hidden rounded-3xl border border-emerald-900/30 bg-emerald-950/10 p-8 transition-colors hover:bg-emerald-950/20"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-500">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-emerald-200">The Solution</h3>
            </div>
            <ul className="space-y-4 text-emerald-200/70">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Centralized, real-time dashboard for all metrics.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Instant alerts for downtime and efficiency drops.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Proactive defect analysis to reduce waste.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Optimized supply chain with predictive insights.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
