"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const IndustryImportance: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0.2, 0.5], [50, 0]);

  return (
    <section ref={targetRef} className="bg-slate-950 px-6 py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div style={{ opacity, y }}>
          <h2 className="text-3xl font-bold text-slate-50 sm:text-5xl leading-tight">
            Why Analytics Matter in <br />
            <span className="text-orange-500">Brake Manufacturing</span>
          </h2>

          <div className="mt-12 space-y-8 text-xl leading-relaxed text-slate-400">
            <p>
              Brake components are critical safety devices. Precision is not just a goal; it's a requirement.
            </p>
            <p>
              <span className="text-slate-200 font-medium">Real-time data</span> transforms how we detect defects, manage inventory, and ensure every part meets the highest standards.
            </p>
            <p>
              By bridging the gap between raw production data and actionable insights, we empower manufacturers to build safer, more reliable products efficiently.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IndustryImportance;
