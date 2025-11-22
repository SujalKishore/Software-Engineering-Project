import React, { useState, useEffect } from "react";
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
import { exportToCSV } from "@/app/utils/csvExport";

interface ProductionRecord {
    id: number;
    date: string;
    line: string;
    shift: string;
    product: string;
    target: number;
    actual: number;
    efficiency: number;
}

const DailyProduction: React.FC = () => {
    const [data, setData] = useState<ProductionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [line, setLine] = useState("All");
    const [shift, setShift] = useState("All");
    const [product, setProduct] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/production");
                const json = await res.json();
                setData(json);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch production data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Data
    const filteredData = data.filter((item) => {
        const itemDate = new Date(item.date);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        const matchesDateFrom = fromDate ? itemDate >= fromDate : true;
        const matchesDateTo = toDate ? itemDate <= toDate : true;
        const matchesLine = line === "All" || item.line === line;
        const matchesShift = shift === "All" || item.shift === shift;
        const matchesProduct = product === "All" || item.product === product;

        return matchesDateFrom && matchesDateTo && matchesLine && matchesShift && matchesProduct;
    });

    // 1. Line-wise Production
    const uniqueLines = Array.from(new Set(data.map(d => d.line)));
    const lineData = uniqueLines.map(l => {
        const totalActual = filteredData
            .filter(d => d.line === l)
            .reduce((sum, d) => sum + d.actual, 0);
        return { name: l, value: totalActual };
    });

    // 2. Shift-wise Comparison
    const uniqueShifts = Array.from(new Set(data.map(d => d.shift)));
    const shiftData = uniqueShifts.map(s => {
        const totalActual = filteredData
            .filter(d => d.shift === s)
            .reduce((sum, d) => sum + d.actual, 0);
        return { name: s, value: totalActual };
    });

    // 3. 7-Day Trend (Efficiency)
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
        }
        return days;
    };
    const last7Days = getLast7Days();
    const trendData = last7Days.map(d => {
        const dateStr = d.toISOString().split("T")[0];
        const dayRecords = data.filter(item => item.date.startsWith(dateStr));
        if (dayRecords.length === 0) return { name: dateStr, efficiency: 0 };

        const avgEff = dayRecords.reduce((sum, item) => sum + item.efficiency, 0) / dayRecords.length;
        return { name: dateStr, efficiency: Math.round(avgEff) };
    });

    // Unique options
    const uniqueProducts = Array.from(new Set(data.map(d => d.product)));

    if (loading) return <div className="p-8 text-slate-400">Loading production data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <section className="border-b border-slate-800 bg-slate-950">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-3 text-xs">
                            <div>
                                <p className="text-[11px] text-slate-400 mb-1">Date range</p>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                    />
                                    <span className="self-center text-[11px] text-slate-500">
                                        –
                                    </span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="text-[11px] text-slate-400 mb-1">Line</p>
                                <select
                                    value={line}
                                    onChange={(e) => setLine(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueLines.map(l => <option key={l}>{l}</option>)}
                                </select>
                            </div>

                            <div>
                                <p className="text-[11px] text-slate-400 mb-1">Shift</p>
                                <select
                                    value={shift}
                                    onChange={(e) => setShift(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueShifts.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <p className="text-[11px] text-slate-400 mb-1">Product</p>
                                <select
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueProducts.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px]">
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    setDateFrom(today);
                                    setDateTo(today);
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    const d = new Date();
                                    d.setDate(d.getDate() - 7);
                                    setDateFrom(d.toISOString().split('T')[0]);
                                    setDateTo(new Date().toISOString().split('T')[0]);
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Last 7 days
                            </button>
                            <button
                                onClick={() => {
                                    setDateFrom("");
                                    setDateTo("");
                                    setLine("All");
                                    setShift("All");
                                    setProduct("All");
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Clear filters
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "production_data")}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="bg-slate-950 px-4 py-8">
                <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2">
                    {/* Line-wise production */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Line-wise production (units)</span>
                            <span>Filtered View</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                    <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Shift-wise comparison */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Shift-wise comparison (units)</span>
                            <span>Filtered View</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={shiftData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Trend chart */}
                <div className="mx-auto mt-6 max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>7-day Efficiency Trend (%)</span>
                        <span>All Lines</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                />
                                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="bg-slate-950 px-4 pb-12">
                <div className="mx-auto max-w-6xl">
                    <h2 className="mb-3 text-sm font-semibold text-slate-50">
                        Production Detail
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                        <table className="min-w-full text-[11px]">
                            <thead className="bg-slate-900/90 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium">Date</th>
                                    <th className="px-3 py-2 text-left font-medium">Line</th>
                                    <th className="px-3 py-2 text-left font-medium">Shift</th>
                                    <th className="px-3 py-2 text-left font-medium">Product</th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        Target
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        Actual
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">Efficiency %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-slate-900/40 border-b border-slate-800/50 last:border-0"
                                        >
                                            <td className="px-3 py-2 align-middle">{new Date(row.date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 align-middle">{row.line}</td>
                                            <td className="px-3 py-2 align-middle">{row.shift}</td>
                                            <td className="px-3 py-2 align-middle">{row.product}</td>
                                            <td className="px-3 py-2 align-middle text-right">
                                                {row.target}
                                            </td>
                                            <td className="px-3 py-2 align-middle text-right">
                                                {row.actual}
                                            </td>
                                            <td className="px-3 py-2 align-middle text-right">
                                                <span className={`px-2 py-0.5 rounded-full ${row.efficiency >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                                                    row.efficiency >= 70 ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {row.efficiency}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DailyProduction;
