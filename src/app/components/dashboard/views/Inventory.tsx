import React, { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { exportToCSV } from "@/app/utils/csvExport";

const Inventory: React.FC = () => {
    const [filter, setFilter] = useState("All");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await fetch("/api/inventory");
                const data = await res.json();
                setItems(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch inventory", error);
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    // Process data for charts
    const categoryData = items.reduce((acc: any, item: any) => {
        const existing = acc.find((i: any) => i.name === item.category);
        if (existing) {
            existing.value += item.stockQty;
        } else {
            acc.push({ name: item.category, value: item.stockQty });
        }
        return acc;
    }, []);

    const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6"];

    const filteredItems =
        filter === "All" ? items : items.filter((i) => i.category === filter);

    if (loading) return <div className="text-slate-400 p-8">Loading Inventory...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                    {["All", "Raw Material", "Work in Progress", "Finished Goods"].map(
                        (cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${filter === cat
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        )
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-64 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-2 text-slate-500">🔍</span>
                    </div>
                    <button
                        onClick={() => exportToCSV(items, "inventory_data")}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                    >
                        Export CSV
                    </button>
                </div>
            </section>

            {/* Visualizations */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Stock Distribution */}
                <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
                    <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-400">
                        Stock Distribution
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        borderColor: "#334155",
                                        color: "#f1f5f9",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-center gap-4">
                        {categoryData.map((entry: any, index: number) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-xs text-slate-400">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Inventory Table */}
                <section className="lg:col-span-2 space-y-6">
                    {/* Low Stock Alerts */}
                    {items.some(i => i.stockQty < i.reorderLevel) && (
                        <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                Low Stock Alerts
                            </h3>
                            <div className="space-y-4">
                                {items.filter(i => i.stockQty < i.reorderLevel).map(item => (
                                    <div key={item.id} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium text-slate-300">{item.name}</span>
                                            <span className="text-red-400">{item.stockQty} / {item.reorderLevel} {item.uom}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-red-500 transition-all duration-500"
                                                style={{ width: `${Math.min((item.stockQty / item.reorderLevel) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden backdrop-blur-sm">
                        <div className="p-6 border-b border-slate-800">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                Detailed Inventory
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Item Code</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Stock</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-300">
                                                {item.code}
                                            </td>
                                            <td className="px-6 py-4">{item.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-300">
                                                {item.stockQty} {item.uom}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${item.stockQty < item.reorderLevel
                                                        ? "bg-red-500/10 text-red-400"
                                                        : "bg-green-500/10 text-green-400"
                                                        }`}
                                                >
                                                    {item.stockQty < item.reorderLevel ? "Low Stock" : "In Stock"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Inventory;
