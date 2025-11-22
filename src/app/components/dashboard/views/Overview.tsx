import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

interface OverviewProps {
    onNavigate: (view: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        productionEfficiency: 0,
        scrapRate: 0,
        pendingOrders: 0,
        dispatchVolume: 0,
    });
    const [productionTrend, setProductionTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all necessary data in parallel
                const [prodRes, scrapRes, ordersRes, dispatchRes] = await Promise.all([
                    fetch("/api/production"),
                    fetch("/api/scrap"),
                    fetch("/api/orders"),
                    fetch("/api/dispatch"),
                ]);

                const prodData = await prodRes.json();
                const scrapData = await scrapRes.json();
                const ordersData = await ordersRes.json();
                const dispatchData = await dispatchRes.json();

                // Calculate KPIs
                const avgEff = prodData.length > 0
                    ? Math.round(prodData.reduce((acc: number, curr: any) => acc + curr.efficiency, 0) / prodData.length)
                    : 0;

                const totalScrap = scrapData.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
                // Simple scrap rate estimation (scrap / (production + scrap)) - simplified for now
                const scrapRate = prodData.length > 0 ? (totalScrap / (prodData.reduce((acc: number, curr: any) => acc + curr.actual, 0) + totalScrap) * 100).toFixed(1) : 0;

                const pending = ordersData.filter((o: any) => o.status === "Open").length;
                const dispatched = dispatchData.length; // Total dispatched records

                setStats({
                    productionEfficiency: avgEff,
                    scrapRate: Number(scrapRate),
                    pendingOrders: pending,
                    dispatchVolume: dispatched,
                });

                // Process Production Trend (Last 7 records)
                const trend = prodData.slice(0, 7).reverse().map((d: any) => ({
                    name: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
                    value: d.efficiency,
                }));
                setProductionTrend(trend);

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch overview data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const kpis = [
        {
            title: "Production Efficiency",
            value: `${stats.productionEfficiency}%`,
            change: "+2.4%",
            trend: "up",
            icon: "⚡",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            title: "Scrap Rate",
            value: `${stats.scrapRate}%`,
            change: "-0.5%",
            trend: "down",
            icon: "🗑️",
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrders.toString(),
            change: "+12",
            trend: "up",
            icon: "🛒",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Dispatch Volume",
            value: stats.dispatchVolume.toString(),
            change: "+8%",
            trend: "up",
            icon: "🚚",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
        },
    ];

    const modules = [
        {
            name: "Daily Production",
            desc: "Track output, efficiency, and downtime",
            icon: "🏭",
            view: "Daily Production",
            color: "from-emerald-500/20 to-emerald-500/5",
            border: "group-hover:border-emerald-500/50",
        },
        {
            name: "Scrap Management",
            desc: "Monitor defects and rejection rates",
            icon: "🗑️",
            view: "Scrap",
            color: "from-red-500/20 to-red-500/5",
            border: "group-hover:border-red-500/50",
        },
        {
            name: "Inventory Control",
            desc: "Manage stock levels and movements",
            icon: "📦",
            view: "Inventory",
            color: "from-blue-500/20 to-blue-500/5",
            border: "group-hover:border-blue-500/50",
        },
        {
            name: "Order Management",
            desc: "Track customer orders and status",
            icon: "🛒",
            view: "Orders",
            color: "from-violet-500/20 to-violet-500/5",
            border: "group-hover:border-violet-500/50",
        },
        {
            name: "Dispatch Planning",
            desc: "Schedule and track shipments",
            icon: "🚚",
            view: "Dispatch",
            color: "from-orange-500/20 to-orange-500/5",
            border: "group-hover:border-orange-500/50",
        },
    ];

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Grid */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, index) => (
                    <div
                        key={index}
                        className={`relative overflow-hidden rounded-xl border ${kpi.border} ${kpi.bg} p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    {kpi.title}
                                </p>
                                <h3 className={`mt-2 text-3xl font-bold ${kpi.color}`}>
                                    {kpi.value}
                                </h3>
                            </div>
                            <span className="text-2xl">{kpi.icon}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span
                                className={`font-medium ${kpi.trend === "up" ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {kpi.change}
                            </span>
                            <span className="text-slate-500">vs last month</span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Efficiency Trend Chart */}
                <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">
                                Efficiency Trend
                            </h3>
                            <p className="text-xs text-slate-400">Last 7 Days Performance</p>
                        </div>
                        <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700">
                            View Report
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={productionTrend}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#334155"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: "#10b981", strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: "#fff" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Quick Actions / Modules */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-100 px-1">
                        Quick Access
                    </h3>
                    <div className="grid gap-3">
                        {modules.map((mod) => (
                            <button
                                key={mod.name}
                                onClick={() => onNavigate(mod.view)}
                                className={`group relative flex w-full items-center gap-4 rounded-xl border border-slate-800 bg-gradient-to-r ${mod.color} p-4 text-left transition-all hover:scale-[1.02] ${mod.border}`}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/50 text-xl shadow-inner">
                                    {mod.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200 group-hover:text-white">
                                        {mod.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 group-hover:text-slate-300">
                                        {mod.desc}
                                    </p>
                                </div>
                                <div className="absolute right-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-slate-400">
                                    →
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Overview;
