import React, { useState } from "react";

interface AdminSidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    onLogout: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeView,
    onNavigate,
    onLogout,
    isMobileOpen = false,
    onMobileClose,
}) => {
    const menuItems = [
        { name: "Overview", view: "Overview", icon: "📊" },
        { name: "Production", view: "Production", icon: "🏭" },
        { name: "Scrap", view: "Scrap", icon: "🗑️" },
        { name: "Inventory", view: "Inventory", icon: "📦" },
        { name: "Orders", view: "Orders", icon: "🛒" },
        { name: "Dispatch", view: "Dispatch", icon: "🚚" },
    ];

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col transition-transform duration-300 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0 md:static md:flex
  `;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onMobileClose}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                            Admin Panel
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-1">
                            Data Management Console
                        </p>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onMobileClose}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.view}
                            onClick={() => {
                                onNavigate(item.view);
                                if (onMobileClose) onMobileClose();
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${activeView === item.view
                                    ? "bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-orange-300 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 transition border border-transparent hover:border-red-500/20"
                    >
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
