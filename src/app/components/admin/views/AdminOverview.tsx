import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const AdminOverview: React.FC = () => {
    const [stats, setStats] = useState({
        inventoryCount: 0,
        openOrders: 0,
        dispatchesInTransit: 0,
        totalOrders: 0,
        totalDispatches: 0,
        lowStockCount: 0,
        avgEfficiency: 0,
        pendingRequests: 0,
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch inventory count & low stock
                const invRes = await fetch("/api/inventory?limit=1000");
                const invData = await invRes.json();
                const lowStock = invData.data ? invData.data.filter((i: any) => i.stockQty <= i.safetyStock).length : 0;

                // Fetch orders count
                const ordRes = await fetch("/api/orders?limit=1000");
                const ordData = await ordRes.json();
                const openOrders = ordData.data ? ordData.data.filter((o: any) => o.status === "Open").length : 0;

                // Fetch dispatch count
                const dispRes = await fetch("/api/dispatch?limit=1000");
                const dispData = await dispRes.json();
                const inTransit = dispData.data ? dispData.data.filter((d: any) => d.status === "In Transit").length : 0;

                // Fetch production for efficiency
                const prodRes = await fetch("/api/production?limit=100");
                const prodData = await prodRes.json();
                const efficiencies = prodData.data ? prodData.data.map((p: any) => p.efficiency) : [];
                const avgEfficiency = efficiencies.length > 0
                    ? Math.round(efficiencies.reduce((a: number, b: number) => a + b, 0) / efficiencies.length)
                    : 0;

                // Fetch pending requests
                const reqRes = await fetch("/api/admin/requests");
                const reqData = await reqRes.json();
                const pendingRequests = Array.isArray(reqData) ? reqData.length : 0;

                setStats({
                    inventoryCount: invData.total || 0,
                    openOrders,
                    dispatchesInTransit: inTransit,
                    totalOrders: ordData.total || 0,
                    totalDispatches: dispData.total || 0,
                    lowStockCount: lowStock,
                    avgEfficiency,
                    pendingRequests,
                });

                // Mock Recent Activity (since we don't have a dedicated activity log API yet)
                // In a real app, we'd fetch this from a /api/activity endpoint
                const activities = [
                    { id: 1, type: "Order", message: "New order #ORD-2024-1234 received", time: "10 mins ago" },
                    { id: 2, type: "Dispatch", message: "Dispatch #LR-2024-5678 marked as Delivered", time: "1 hour ago" },
                    { id: 3, type: "Inventory", message: "Low stock alert: Steel Sheets (RM-01)", time: "2 hours ago" },
                    { id: 4, type: "System", message: "Daily backup completed successfully", time: "4 hours ago" },
                ];
                setRecentActivity(activities);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch stats", error);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const chartData = [
        { name: "Orders", value: stats.totalOrders, color: "#3b82f6" },
        { name: "Dispatches", value: stats.totalDispatches, color: "#10b981" },
    ];

    const COLORS = ["#3b82f6", "#10b981", "#f97316"];

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-50">Dashboard Overview</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Low Stock Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">⚠️</span>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Low Stock Items</p>
                    <h3 className="text-3xl font-bold text-slate-100">{stats.lowStockCount}</h3>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-1/4"></div>
                    </div>
                </div>

                {/* Efficiency Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">⚡</span>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Avg. Production Efficiency</p>
                    <h3 className="text-3xl font-bold text-slate-100">{stats.avgEfficiency}%</h3>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${stats.avgEfficiency}%` }}></div>
                    </div>
                </div>

                {/* Pending Requests Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-6xl">📝</span>
                    </div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Pending Requests</p>
                    <h3 className="text-3xl font-bold text-slate-100">{stats.pendingRequests}</h3>
                    <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 w-1/3"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders vs Dispatch Chart */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Orders vs Dispatches</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f1f5f9" }}
                                    itemStyle={{ color: "#f1f5f9" }}
                                    cursor={{ fill: "#1e293b", opacity: 0.5 }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity & System Status */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Recent Activity</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-3 items-start">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${activity.type === "Order" ? "bg-blue-500" :
                                        activity.type === "Dispatch" ? "bg-emerald-500" :
                                            activity.type === "Inventory" ? "bg-orange-500" : "bg-slate-500"
                                        }`} />
                                    <div>
                                        <p className="text-xs text-slate-300">{activity.message}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <span>Database</span>
                                </div>
                                <span className="text-green-500 text-xs font-medium">Connected</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <span>API Services</span>
                                </div>
                                <span className="text-green-500 text-xs font-medium">Operational</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    <span>Next.js Server</span>
                                </div>
                                <span className="text-blue-500 text-xs font-medium">v14.0.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
