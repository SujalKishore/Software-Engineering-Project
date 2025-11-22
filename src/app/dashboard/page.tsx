"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentView, setCurrentView] = useState("Overview");

  useEffect(() => {
    const isAuthed =
      typeof window !== "undefined" &&
      sessionStorage.getItem("isAuthenticated") === "true";

    if (!isAuthed) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">Checking access…</p>
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
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero / header */}
        <section className="border-b border-slate-800 bg-slate-950/90">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
              {headerConfig.breadcrumb}
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl md:text-4xl">
              {headerConfig.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {headerConfig.description}
            </p>
          </div>
        </section>

        <QuickAccessModules
          activeView={currentView}
          onNavigate={setCurrentView}
        />

        {renderView()}
      </main>

      <Footer />
    </div>
  );
}
