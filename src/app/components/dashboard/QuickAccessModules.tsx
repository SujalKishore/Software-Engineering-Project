"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Factory, Trash2, ShoppingCart, Package, Truck, ArrowUpRight, Zap } from "lucide-react";

interface QuickAccessModulesProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const modules = [
  {
    name: "Overview",
    view: "Overview",
    short: "Overview",
    icon: LayoutDashboard,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    name: "Daily Production",
    view: "DailyProduction",
    short: "Production",
    icon: Factory,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    name: "Scrap & Quality",
    view: "Scrap",
    short: "Scrap",
    icon: Trash2,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    name: "Customer Orders",
    view: "Orders",
    short: "Orders",
    icon: ShoppingCart,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    name: "Inventory",
    view: "Inventory",
    short: "Inventory",
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    name: "Dispatch & Logistics",
    view: "Dispatch",
    short: "Dispatch",
    icon: Truck,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    name: "AI Optimizer",
    view: "ProductionOptimizer",
    short: "AI Optimizer",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const QuickAccessModules: React.FC<QuickAccessModulesProps> = ({
  activeView,
  onNavigate,
}) => {
  return (
    <section className="sticky top-[80px] z-40 mx-auto max-w-7xl px-4 mb-6">
      <div className="rounded-3xl border border-white/5 bg-slate-950/60 backdrop-blur-2xl px-6 py-4 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Quick Access
          </p>
          <span className="text-[10px] text-slate-600">
            Press <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">Alt</kbd> + <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">Number</kbd> to switch
          </span>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {modules.map((mod) => {
            const isActive = activeView === mod.view;
            const Icon = mod.icon;

            return (
              <motion.button
                key={mod.name}
                variants={item}
                onClick={() => onNavigate(mod.view)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative group flex flex-col items-start justify-between p-3 h-24 rounded-2xl border transition-all duration-300
                  ${isActive
                    ? `${mod.bg} ${mod.border} shadow-lg shadow-${mod.color.split('-')[1]}-500/10`
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  }
                `}
              >
                <div className={`
                  p-2 rounded-xl mb-2 transition-colors duration-300
                  ${isActive ? "bg-white/10" : "bg-slate-900 group-hover:bg-slate-800"}
                `}>
                  <Icon size={18} className={`transition-colors duration-300 ${isActive ? "text-white" : mod.color}`} />
                </div>

                <div className="w-full flex items-center justify-between">
                  <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {mod.short}
                  </span>
                  <ArrowUpRight
                    size={12}
                    className={`transition-all duration-300 ${isActive ? "text-white opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"}`}
                  />
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default QuickAccessModules;
