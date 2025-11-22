import React, { useEffect, useState } from "react";

const AdminOverview: React.FC = () => {
    const [stats, setStats] = useState({
        inventoryCount: 0,
        openOrders: 0,
        dispatchesInTransit: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch inventory count
                const invRes = await fetch("/api/inventory");
                const invData = await invRes.json();

                // Fetch orders count
                const ordRes = await fetch("/api/orders");
                const ordData = await ordRes.json();
                const openOrders = ordData.filter((o: any) => o.status === "Open").length;

                // Fetch dispatch count
                const dispRes = await fetch("/api/dispatch");
                const dispData = await dispRes.json();
                const inTransit = dispData.filter((d: any) => d.status === "In Transit").length;

                setStats({
                    inventoryCount: invData.length,
                    openOrders,
                    dispatchesInTransit: inTransit,
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-slate-50 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Inventory Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">📦</span>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Total Inventory Items</p>
                    <h3 className="text-3xl font-bold text-slate-100">{stats.inventoryCount}</h3>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-2/3"></div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">🛒</span>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Open Orders</p>
                    <h3 className="text-3xl font-bold text-slate-100">{stats.openOrders}</h3>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-1/2"></div>
                    </div>
                </div>

                {/* Dispatch Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">🚚</span>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Dispatches In Transit</p>
                    <h3 className="text-3xl font-bold text-slate-100">{stats.dispatchesInTransit}</h3>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-3/4"></div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">System Status</h3>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span>Database Connected (SQLite)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span>API Services Operational</span>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
