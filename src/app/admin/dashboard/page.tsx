"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import AdminInventory from "@/app/components/admin/views/AdminInventory";
import AdminOrders from "@/app/components/admin/views/AdminOrders";
import AdminDispatch from "@/app/components/admin/views/AdminDispatch";
import AdminOverview from "@/app/components/admin/views/AdminOverview";
import AdminProduction from "@/app/components/admin/views/AdminProduction";
import AdminScrap from "@/app/components/admin/views/AdminScrap";

export default function AdminDashboard() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [currentView, setCurrentView] = useState("Overview");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        // TODO: Replace with real auth check later
        const isAuthed =
            typeof window !== "undefined" &&
            sessionStorage.getItem("isAdminAuthenticated") === "true";

        if (!isAuthed) {
            router.replace("/admin");
        } else {
            setCheckingAuth(false);
        }
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem("isAdminAuthenticated");
        router.replace("/admin");
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-orange-500"></div>
                    <p className="text-slate-400 text-xs uppercase tracking-widest">
                        Verifying Access...
                    </p>
                </div>
            </div>
        );
    }

    const renderView = () => {
        switch (currentView) {
            case "Overview":
                return <AdminOverview />;
            case "Production":
                return <AdminProduction />;
            case "Scrap":
                return <AdminScrap />;
            case "Inventory":
                return <AdminInventory />;
            case "Orders":
                return <AdminOrders />;
            case "Dispatch":
                return <AdminDispatch />;
            default:
                return <AdminOverview />;
        }
    };

    return (
        <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
            <AdminSidebar
                activeView={currentView}
                onNavigate={setCurrentView}
                onLogout={handleLogout}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            <main className="flex-1 bg-slate-950 relative overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                {/* Background Gradients */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl" />
                    <div className="absolute top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                className="md:hidden text-slate-400 hover:text-white mr-2"
                            >
                                ☰
                            </button>
                            <span className="h-px w-8 bg-orange-500/50 hidden md:block"></span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
                                Admin Console
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-3">
                            {currentView} Management
                        </h1>
                        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                            Manage your {currentView.toLowerCase()} records efficiently. Changes made here will reflect immediately across the platform.
                        </p>
                    </header>

                    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-1 shadow-2xl">
                        {renderView()}
                    </div>
                </div>
            </main>
        </div>
    );
}
