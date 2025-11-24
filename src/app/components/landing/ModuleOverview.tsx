"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";
import { Activity, Trash2, Package, ShoppingCart, Truck } from "lucide-react";

const content = [
  {
    title: "Production Analytics",
    description:
      "Track daily output, efficiency (OEE), and downtime in real-time. Visualize production trends across different lines and shifts to identify bottlenecks instantly.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
        <Activity size={80} />
      </div>
    ),
  },
  {
    title: "Scrap & Quality",
    description:
      "Monitor rejection rates and identify top defect causes. Analyze scrap data by product, machine, or operator to implement targeted quality improvements.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
        <Trash2 size={80} />
      </div>
    ),
  },
  {
    title: "Inventory Management",
    description:
      "Keep track of raw materials and finished goods. Set low-stock alerts and monitor aging inventory to optimize stock levels and reduce carrying costs.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
        <Package size={80} />
      </div>
    ),
  },
  {
    title: "Order Fulfillment",
    description:
      "Track customer orders from placement to delivery. Monitor on-time delivery rates and backlog status to ensure customer satisfaction.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
        <ShoppingCart size={80} />
      </div>
    ),
  },
  {
    title: "Dispatch & Logistics",
    description:
      "Manage vehicle tracking, shipment planning, and transport costs. Optimize routes and ensure timely dispatch of finished goods.",
    content: (
      <div className="h-full w-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
        <Truck size={80} />
      </div>
    ),
  },
];

const ModuleOverview: React.FC = () => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <section
      ref={ref}
      className="h-[300vh] bg-slate-950 relative flex justify-center space-x-20 p-10"
    >
      <div className="div relative flex items-start px-4">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20 min-h-[40vh]">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-4xl font-bold text-slate-50 mb-6"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                className="text-lg text-slate-400 max-w-sm leading-relaxed"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        className="hidden lg:block h-80 w-[500px] rounded-3xl bg-slate-900 border border-slate-800 sticky top-1/3 overflow-hidden shadow-2xl"
      >
        <motion.div
          animate={{
            backgroundColor:
              activeCard % 2 === 0 ? "#0f172a" : "#0f172a", // slate-900
          }}
          className="h-full w-full flex items-center justify-center"
        >
          {content[activeCard].content}
        </motion.div>
      </div>
    </section>
  );
};

export default ModuleOverview;
