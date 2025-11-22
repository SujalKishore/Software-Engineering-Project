import React, { useState, useEffect } from "react";
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
import { exportToCSV } from "@/app/utils/csvExport";

interface DispatchRecord {
    id: number;
    lrNo: string;
    date: string;
    customer: string;
    region: string;
    transporter: string;
    truckNo: string;
    route: string;
    cartons: number;
    status: string;
}

const Dispatch: React.FC = () => {
    const [data, setData] = useState<DispatchRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState("");
    const [transporter, setTransporter] = useState("All");
    const [region, setRegion] = useState("All");
    const [customer, setCustomer] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/dispatch");
                const json = await res.json();
                setData(json);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch dispatch data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Data
    const filteredData = data.filter((item) => {
        const matchesDate = dateFilter ? item.date.startsWith(dateFilter) : true;
        const matchesTransporter = transporter === "All" || item.transporter === transporter;
        const matchesRegion = region === "All" || item.region === region;
        const matchesCustomer = customer === "All" || item.customer === customer;
        return matchesDate && matchesTransporter && matchesRegion && matchesCustomer;
    });

    // 1. Daily Dispatch Volume (Last 7 Days from data or just available days)
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
    const dailyDispatchData = last7Days.map((d) => {
        const dateStr = d.toISOString().split("T")[0];
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

        const volume = data
            .filter((item) => item.date.startsWith(dateStr))
            .reduce((sum, item) => sum + item.cartons, 0);

        return { name: dayName, volume, fullDate: dateStr };
    });

    // 2. On-Time vs Delayed
    const totalShipments = filteredData.length;
    const onTimeCount = filteredData.filter(d => d.status === "Delivered").length;
    const delayedCount = totalShipments - onTimeCount;

    const statusData = [
        { name: "Delivered", value: onTimeCount },
        { name: "Delayed/Other", value: delayedCount },
    ];
    const STATUS_COLORS = ["#10b981", "#f59e0b"];

    // 3. Region Blocks
    const regions = ["North", "South", "East", "West", "Central", "Export"];
    const regionBlocks = regions.map(r => {
        const count = data.filter(d => d.region === r).length;
        let status = "Healthy";
        if (count > 15) status = "Minor delays";
        if (count < 5) status = "Watch";
        if (r === "Export") status = "Critical docs";

        return { region: r, shipments: count, status };
    });

    // Unique options for dropdowns
    const uniqueTransporters = Array.from(new Set(data.map(d => d.transporter)));
    const uniqueRegions = Array.from(new Set(data.map(d => d.region)));
    const uniqueCustomers = Array.from(new Set(data.map(d => d.customer)));

    if (loading) return <div className="p-8 text-slate-400">Loading dispatch data...</div>;

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
                                <p className="mb-1 text-[11px] text-slate-400">Transporter</p>
                                <select
                                    value={transporter}
                                    onChange={(e) => setTransporter(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueTransporters.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Region</p>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueRegions.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Customer</p>
                                <select
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueCustomers.map(c => <option key={c}>{c}</option>)}
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
                                    setTransporter("All");
                                    setRegion("All");
                                    setCustomer("All");
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Clear filters
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "dispatch_data")}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visuals */}
            <section className="bg-slate-950 px-4 py-8">
                <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
                    {/* Daily dispatch volume */}
                    <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Daily dispatch volume (cartons / day)</span>
                            <span>Last 7 Days</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyDispatchData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                    <Bar dataKey="volume" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">
                            Track how many cartons leave the plant each day.
                        </p>
                    </div>

                    {/* On-time vs delayed */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="mb-2 text-[11px] text-slate-400">
                            Delivery Status (Filtered)
                        </p>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {statusData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[index] }} />
                                    <span className="text-xs text-slate-400">{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Region-wise "map" */}
                <div className="mx-auto mt-6 max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Region-wise dispatch (All Time)</span>
                        <span>Overview</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {regionBlocks.map((r) => (
                            <div
                                key={r.region}
                                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                            >
                                <p className="text-xs font-semibold text-slate-50">
                                    {r.region}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-300">
                                    Shipments:{" "}
                                    <span className="font-semibold text-orange-200">
                                        {r.shipments}
                                    </span>
                                </p>
                                <p
                                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.status === "Healthy"
                                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                        : r.status === "Minor delays"
                                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                                            : r.status === "On track"
                                                ? "bg-slate-500/10 text-slate-200 border border-slate-500/40"
                                                : "bg-red-500/10 text-red-300 border border-red-500/40"
                                        }`}
                                >
                                    {r.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dispatch records table */}
            <section className="bg-slate-950 px-4 pb-12">
                <div className="mx-auto max-w-6xl">
                    <h2 className="mb-3 text-sm font-semibold text-slate-50">
                        Dispatch Detail
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                        <table className="min-w-full text-[11px]">
                            <thead className="bg-slate-900/90 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium">LR No.</th>
                                    <th className="px-3 py-2 text-left font-medium">Date</th>
                                    <th className="px-3 py-2 text-left font-medium">Customer</th>
                                    <th className="px-3 py-2 text-left font-medium">Region</th>
                                    <th className="px-3 py-2 text-left font-medium">
                                        Transporter
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium">Truck No.</th>
                                    <th className="px-3 py-2 text-left font-medium">Route</th>
                                    <th className="px-3 py-2 text-right font-medium">Cartons</th>
                                    <th className="px-3 py-2 text-left font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-3 py-4 text-center text-slate-500">
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, idx) => (
                                        <tr
                                            key={row.id}
                                            className={
                                                idx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-900/40"
                                            }
                                        >
                                            <td className="px-3 py-2 align-middle">{row.lrNo}</td>
                                            <td className="px-3 py-2 align-middle">{new Date(row.date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 align-middle">{row.customer}</td>
                                            <td className="px-3 py-2 align-middle">{row.region}</td>
                                            <td className="px-3 py-2 align-middle">
                                                {row.transporter}
                                            </td>
                                            <td className="px-3 py-2 align-middle">{row.truckNo}</td>
                                            <td className="px-3 py-2 align-middle">{row.route}</td>
                                            <td className="px-3 py-2 align-middle text-right">
                                                {row.cartons}
                                            </td>
                                            <td className="px-3 py-2 align-middle">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${row.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    row.status === 'Delayed' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-blue-500/10 text-blue-400'
                                                    }`}>
                                                    {row.status}
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

export default Dispatch;
