"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import AdminInventory from "@/app/components/admin/views/AdminInventory";
import AdminOrders from "@/app/components/admin/views/AdminOrders";
import AdminDispatch from "@/app/components/admin/views/AdminDispatch";
import AdminOverview from "@/app/components/admin/views/AdminOverview";
import AdminProduction from "@/app/components/admin/views/AdminProduction";
import AdminScrap from "@/app/components/admin/views/AdminScrap";
import AdminRequests from "@/app/components/admin/views/AdminRequests";

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [currentView, setCurrentView] = useState("Overview");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === "loading") return;

        // Debugging: Log session
        console.log("AdminDashboard Session:", session);
        console.log("AdminDashboard Status:", status);

        // if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
        //     router.replace("/login");
        // }
    }, [session, status, router]);

    if (status === "loading") {
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

    if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 gap-4">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p>You are not authorized to view this page.</p>
                <div className="bg-slate-900 p-4 rounded text-xs font-mono text-left">
                    <p>Status: {status}</p>
                    <p>Role: {(session?.user as any)?.role || "None"}</p>
                    <p>User: {session?.user?.email || "None"}</p>
                </div>
                <button
                    onClick={() => router.push("/login")}
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    const handleLogout = async () => {
        sessionStorage.removeItem("isAdminAuthenticated");
        await signOut({ callbackUrl: "/login" });
    };

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
            case "Requests":
                return <AdminRequests />;
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
