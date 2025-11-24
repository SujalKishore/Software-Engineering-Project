"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/app/components/landing/Navbar";
import Footer from "@/app/components/landing/Footer";
import QuickAccessModules from "../components/dashboard/QuickAccessModules";

// Views
import Overview from "../components/dashboard/views/Overview";
import DailyProduction from "../components/dashboard/views/DailyProduction";
import Scrap from "../components/dashboard/views/Scrap";
import Orders from "../components/dashboard/views/Orders";
import Inventory from "../components/dashboard/views/Inventory";
import Dispatch from "../components/dashboard/views/Dispatch";

export default function DashboardHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState("Overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">Checking access...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Header configuration based on view
  const getHeaderConfig = () => {
    switch (currentView) {
      case "Overview":
        return {
          breadcrumb: "Dashboard Home",
          title: "Brake Manufacturing Analytics Overview",
          description:
            "High-level view of production performance, scrap, customer orders, inventory health, and dispatch reliability for brake shoes & brake pads manufacturing.",
        };
      case "DailyProduction":
        return {
          breadcrumb: "Dashboard · Daily Production",
          title: "Daily Production Dashboard",
          description:
            "Monitor line-wise and shift-wise output, track short-term trends, and review hourly data for brake shoes & brake pads production.",
        };
      case "Scrap":
        return {
          breadcrumb: "Dashboard · Scrap Percentage",
          title: "Scrap & Defects Dashboard",
          description:
            "Analyze scrap percentage across lines, identify top defect reasons, and review root-cause details for brake shoes & brake pads production.",
        };
      case "Orders":
        return {
          breadcrumb: "Dashboard · Customer Orders",
          title: "Customer Orders & Delivery Performance",
          description:
            "Track open vs completed orders, on-time delivery, and aging of pending orders for brake shoes & brake pads customers.",
        };
      case "Inventory":
        return {
          breadcrumb: "Dashboard · Inventory Levels",
          title: "Inventory & Stock Position",
          description:
            "Monitor stock levels for raw materials, WIP, and finished goods, track days of inventory, and identify fast and slow moving items.",
        };
      case "Dispatch":
        return {
          breadcrumb: "Dashboard · Dispatch & Logistics",
          title: "Dispatch & Logistics Dashboard",
          description:
            "Track daily dispatch volume, on-time vs delayed shipments, and region-wise dispatch performance for brake shoes & brake pads.",
        };
      default:
        return {
          breadcrumb: "Dashboard",
          title: "Dashboard",
          description: "",
        };
    }
  };

  const headerConfig = getHeaderConfig();

  const renderView = () => {
    switch (currentView) {
      case "Overview":
        return <Overview onNavigate={setCurrentView} />;
      case "DailyProduction":
        return <DailyProduction />;
      case "Scrap":
        return <Scrap />;
      case "Orders":
        return <Orders />;
      case "Inventory":
        return <Inventory />;
      case "Dispatch":
        return <Dispatch />;
      default:
        return <Overview onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

      <Navbar />

      <main className="flex-1 pt-24 pb-12 relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Hero / header */}
        <section className="mx-auto max-w-7xl mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-2">
                {headerConfig.breadcrumb}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-3">
                {headerConfig.title}
              </h1>
              <p className="max-w-3xl text-sm text-slate-400 leading-relaxed">
                {headerConfig.description}
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl">
          <QuickAccessModules
            activeView={currentView}
            onNavigate={setCurrentView}
          />

          <div className="mt-8">
            {renderView()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
