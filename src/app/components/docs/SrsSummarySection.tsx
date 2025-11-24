"use client";
import React, { useState } from "react";
import AnimatedSection from "../ui/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Database, Shield, Zap } from "lucide-react";

const tabs = [
  {
    id: "overview",
    label: "System Overview",
    icon: Database,
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          The Brake Manufacturing Analytics Dashboard is a centralized platform designed to aggregate data from various production stages. It replaces manual logging with automated, real-time visualization.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {["Real-time Data Ingestion", "Role-based Access Control", "Interactive Visualizations", "Exportable Reports"].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "users",
    label: "Users & Roles",
    icon: Users,
    content: (
      <div className="space-y-6">
        <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-800">
          <h4 className="font-semibold text-orange-400 mb-2">Admin / Plant Manager</h4>
          <p className="text-sm text-slate-400">Full access to all dashboards, user management, and system configuration. Can export sensitive reports.</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-800">
          <h4 className="font-semibold text-blue-400 mb-2">Supervisor</h4>
          <p className="text-sm text-slate-400">Access to specific line production data, scrap entry, and shift reports. Read-only access to financial metrics.</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-800">
          <h4 className="font-semibold text-emerald-400 mb-2">Operator</h4>
          <p className="text-sm text-slate-400">Limited access. Can view daily targets and input basic production counts via simplified forms.</p>
        </div>
      </div>
    ),
  },
  {
    id: "functional",
    label: "Functional Reqs",
    icon: Zap,
    content: (
      <ul className="space-y-3">
        {[
          "User Authentication (Login/Logout/Session Management)",
          "Data Visualization (Charts, Graphs, KPIs)",
          "Filtering & Slicing (Date, Shift, Line, Product)",
          "Data Entry Forms (Production, Scrap, Inventory)",
          "Alert System (Low Stock, High Scrap Rate)",
        ].map((req, i) => (
          <li key={i} className="flex items-start gap-3 rounded-lg bg-slate-900/30 p-3 border border-slate-800/50">
            <div className="mt-1 rounded-full bg-orange-500/20 p-1 text-orange-500">
              <Zap size={12} />
            </div>
            <span className="text-sm text-slate-300">{req}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "non-functional",
    label: "Non-Functional",
    icon: Shield,
    content: (
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Performance", desc: "Load dashboards in < 2 seconds." },
          { title: "Security", desc: "Encrypted data transmission (HTTPS)." },
          { title: "Scalability", desc: "Support up to 100 concurrent users." },
          { title: "Availability", desc: "99.9% uptime during production shifts." },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h4 className="font-semibold text-slate-200 mb-1">{item.title}</h4>
            <p className="text-xs text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
];

const SrsSummarySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="bg-slate-950 px-4 py-24">
      <AnimatedSection className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-50">SRS Summary</h2>
          <p className="mt-2 text-slate-400">Software Requirements Specification Highlights</p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Tabs Navigation */}
          <div className="flex flex-row gap-2 overflow-x-auto md:w-1/3 md:flex-col md:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-4 text-left transition-all ${activeTab === tab.id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-slate-900/50 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
              >
                <tab.icon size={20} />
                <span className="font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="mb-6 text-2xl font-bold text-slate-50">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </h3>
                {tabs.find((t) => t.id === activeTab)?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default SrsSummarySection;
