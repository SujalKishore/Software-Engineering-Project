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
    RadialBarChart,
    RadialBar,
    Legend,
} from "recharts";
import { exportToCSV } from "@/app/utils/csvExport";

interface ScrapRecord {
    id: number;
    date: string;
    line: string;
    defectType: string;
    quantity: number;
    reason: string;
}

const Scrap: React.FC = () => {
    const [data, setData] = useState<ScrapRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("");
    const [line, setLine] = useState("All");
    const [defectType, setDefectType] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/scrap");
                const json = await res.json();
                setData(json);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch scrap data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Data
    const filteredData = data.filter((item) => {
        const matchesDate = dateFilter ? item.date.startsWith(dateFilter) : true;
        const matchesLine = line === "All" || item.line === line;
        const matchesDefect = defectType === "All" || item.defectType === defectType;
        return matchesDate && matchesLine && matchesDefect;
    });

    // 1. Scrap by Line (Quantity)
    const uniqueLines = Array.from(new Set(data.map(d => d.line)));
    const scrapByLineData = uniqueLines.map(l => {
        const totalQty = filteredData
            .filter(d => d.line === l)
            .reduce((sum, d) => sum + d.quantity, 0);
        return { name: l, quantity: totalQty };
    });

    // 2. Top Defects
    const uniqueDefects = Array.from(new Set(data.map(d => d.defectType)));
    const defectCounts = uniqueDefects.map(d => {
        const count = filteredData
            .filter(item => item.defectType === d)
            .reduce((sum, item) => sum + item.quantity, 0);
        return { code: d, quantity: count };
    });
    // Sort by quantity desc
    const topDefects = defectCounts.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const totalScrap = defectCounts.reduce((sum, d) => sum + d.quantity, 0);

    // 3. Trend (Quantity)
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
        const dayQty = data
            .filter(item => item.date.startsWith(dateStr))
            .reduce((sum, item) => sum + item.quantity, 0);
        return { name: dateStr, quantity: dayQty };
    });

    // 4. Gauge Data (Mock Target for Demo)
    const scrapTarget = 50; // Example daily target limit
    const gaugeData = [
        {
            name: "Target Limit",
            uv: 100,
            pv: 2400,
            fill: "#334155",
        },
        {
            name: "Actual Scrap",
            uv: Math.min((totalScrap / scrapTarget) * 100, 100), // Cap at 100 for visual
            pv: 4567,
            fill: totalScrap > scrapTarget ? "#ef4444" : "#22c55e",
        },
    ];

    if (loading) return <div className="p-8 text-slate-400">Loading scrap data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <section className="border-b border-slate-800 bg-slate-950">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-3 text-xs">
                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Date</p>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                />
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Line</p>
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
                                <p className="mb-1 text-[11px] text-slate-400">Defect type</p>
                                <select
                                    value={defectType}
                                    onChange={(e) => setDefectType(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueDefects.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px]">
                            <button
                                onClick={() => {
                                    setDateFilter(new Date().toISOString().split('T')[0]);
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    setDateFilter("");
                                    setLine("All");
                                    setDefectType("All");
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Clear filters
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "scrap_data")}
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
                <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
                    {/* Scrap Gauge */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col items-center justify-center">
                        <div className="mb-3 w-full flex items-center justify-between text-[11px] text-slate-400">
                            <span>Scrap vs Target Limit</span>
                            <span>Daily Limit: {scrapTarget}</span>
                        </div>
                        <div className="h-48 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="100%"
                                    barSize={10}
                                    data={gaugeData}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar
                                        background
                                        dataKey="uv"
                                    />
                                    <Legend
                                        iconSize={10}
                                        width={120}
                                        height={140}
                                        layout="vertical"
                                        verticalAlign="middle"
                                        wrapperStyle={{
                                            top: '50%',
                                            right: 0,
                                            transform: 'translate(0, -50%)',
                                            lineHeight: '24px',
                                        }}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pt-8 pointer-events-none">
                                <span className="text-2xl font-bold text-slate-100">{totalScrap}</span>
                                <span className="text-[10px] text-slate-500">Total Scrap</span>
                            </div>
                        </div>
                    </div>

                    {/* Scrap by line */}
                    <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Scrap Quantity by line</span>
                            <span>Filtered View</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scrapByLineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                    <Bar dataKey="quantity" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-6 max-w-6xl grid gap-6 md:grid-cols-2">
                    {/* Top defect reasons */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Top defect reasons</span>
                            <span>Filtered View</span>
                        </div>
                        <div className="space-y-2">
                            {topDefects.map((def) => (
                                <div
                                    key={def.code}
                                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-semibold text-slate-50">
                                            {def.code}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Root-cause analysis required.
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-red-300">
                                        {def.quantity} ({totalScrap > 0 ? Math.round((def.quantity / totalScrap) * 100) : 0}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trend vs Target */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Scrap Quantity trend (last 7 days)</span>
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
                                    <Line type="monotone" dataKey="quantity" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Root-cause table */}
            <section className="bg-slate-950 px-4 pb-12">
                <div className="mx-auto max-w-6xl">
                    <h2 className="mb-3 text-sm font-semibold text-slate-50">
                        Scrap Detail
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                        <table className="min-w-full text-[11px]">
                            <thead className="bg-slate-900/90 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium">Date</th>
                                    <th className="px-3 py-2 text-left font-medium">Line</th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Defect Type
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Reason
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        Quantity
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
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
                                            <td className="px-3 py-2 align-middle">{row.defectType}</td>
                                            <td className="px-3 py-2 align-middle">{row.reason}</td>
                                            <td className="px-3 py-2 align-middle text-right">
                                                {row.quantity}
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

export default Scrap;
