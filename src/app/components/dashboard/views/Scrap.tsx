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
import { Search, Calendar, Filter, Download, ChevronLeft, ChevronRight, AlertTriangle, Plus, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [line, setLine] = useState("All");
    const [defectType, setDefectType] = useState("All");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ScrapRecord | null>(null);
    const [formData, setFormData] = useState<Partial<ScrapRecord>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/scrap?limit=500&offset=0`);
            const json = await res.json();
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch (error) {
            console.error("Failed to fetch scrap data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Data
    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.defectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.reason.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = dateFilter ? item.date.startsWith(dateFilter) : true;
        const matchesLine = line === "All" || item.line === line;
        const matchesDefect = defectType === "All" || item.defectType === defectType;

        return matchesSearch && matchesDate && matchesLine && matchesDefect;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // 1. Scrap by Line (Quantity)
    const uniqueLines = Array.from(new Set([...data.map(d => d.line), "Line 1", "Line 2", "Line 3", "Assembly", "Packaging"])).sort();
    const scrapByLineData = uniqueLines.map(l => {
        const totalQty = filteredData
            .filter(d => d.line === l)
            .reduce((sum, d) => sum + d.quantity, 0);
        return { name: l, quantity: totalQty };
    });

    // 2. Top Defects
    const uniqueDefects = Array.from(new Set([...data.map(d => d.defectType), "Dimensional", "Material", "Assembly", "Finishing", "Packaging", "Other"])).sort();
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

    // Handlers
    const openModal = (record?: ScrapRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData(record);
        } else {
            setEditingRecord(null);
            setFormData({
                date: new Date().toISOString().split("T")[0],
                line: "Line 1",
                defectType: "Dimensional",
                quantity: 0,
                reason: "",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
        setFormData({});
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                quantity: Number(formData.quantity || 0),
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
            };

            let res;
            if (editingRecord) {
                res = await fetch("/api/scrap", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id: editingRecord.id }),
                });
            } else {
                res = await fetch("/api/scrap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();

            if (data.pending) {
                alert("Request submitted for approval!");
            } else {
                await fetchData();
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save record", error);
            alert("Failed to save record");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this record? This action will create a request for admin approval.")) {
            try {
                const res = await fetch(`/api/scrap?id=${id}`, {
                    method: "DELETE",
                });
                const data = await res.json();

                if (data.pending) {
                    alert("Delete request submitted for approval!");
                } else {
                    await fetchData();
                }
            } catch (error) {
                console.error("Failed to delete record", error);
                alert("Failed to delete record");
            }
        }
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search defects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 rounded-xl border border-white/10 bg-slate-950/50 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all outline-none"
                                />
                            </div>

                            {/* Date Filter */}
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-1.5">
                                <Calendar size={14} className="text-slate-500" />
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="bg-transparent text-xs text-white outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex gap-2">
                                {[
                                    { label: "Line", value: line, setter: setLine, options: uniqueLines },
                                    { label: "Defect Type", value: defectType, setter: setDefectType, options: uniqueDefects },
                                ].map((filter) => (
                                    <div key={filter.label} className="relative">
                                        <select
                                            value={filter.value}
                                            onChange={(e) => filter.setter(e.target.value)}
                                            className="appearance-none rounded-xl border border-white/10 bg-slate-950/50 pl-3 pr-8 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:bg-slate-900"
                                        >
                                            <option>All</option>
                                            {filter.options.map(opt => <option key={opt}>{opt}</option>)}
                                        </select>
                                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setDateFilter("");
                                    setLine("All");
                                    setDefectType("All");
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "scrap_data")}
                                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
                            >
                                <Download size={14} />
                                Export CSV
                            </button>
                            <button
                                onClick={() => openModal()}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                <Plus size={14} />
                                Add Record
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="grid gap-6 md:grid-cols-3">
                {/* Scrap Gauge */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <AlertTriangle size={120} className="text-red-500" />
                    </div>
                    <div className="mb-3 w-full flex items-center justify-between text-xs text-slate-400 relative z-10">
                        <span className="font-medium text-white">Scrap vs Target</span>
                        <span>Limit: {scrapTarget}</span>
                    </div>
                    <div className="h-48 w-full relative z-10">
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
                                    cornerRadius={10}
                                />
                                <Legend
                                    iconSize={8}
                                    width={120}
                                    height={140}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    wrapperStyle={{
                                        top: '60%',
                                        right: 0,
                                        transform: 'translate(0, -50%)',
                                        lineHeight: '20px',
                                        fontSize: '10px',
                                        color: '#94a3b8'
                                    }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pt-8 pointer-events-none">
                            <span className={`text-3xl font-bold ${totalScrap > scrapTarget ? 'text-red-500' : 'text-emerald-500'}`}>{totalScrap}</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500">Total Scrap</span>
                        </div>
                    </div>
                </div>

                {/* Scrap by line */}
                <div className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Scrap by Line</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Quantity</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scrapByLineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Bar dataKey="quantity" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                {/* Top defect reasons */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Top Defect Reasons</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Critical Issues</span>
                    </div>
                    <div className="space-y-3">
                        {topDefects.map((def, idx) => (
                            <div
                                key={def.code}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                                        {idx + 1}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">
                                            {def.code}
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Root-cause analysis required
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-red-400">
                                        {def.quantity}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {totalScrap > 0 ? Math.round((def.quantity / totalScrap) * 100) : 0}% of total
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trend vs Target */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Scrap Trend</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Last 7 Days</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Line type="monotone" dataKey="quantity" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#fff" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Root-cause table */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white">Scrap Detail</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Rows:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 outline-none focus:border-orange-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                        <thead className="bg-white/5 text-slate-200 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Line</th>
                                <th className="px-6 py-4">Defect Type</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No records found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-slate-300">{new Date(row.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                                                {row.line}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{row.defectType}</td>
                                        <td className="px-6 py-4 text-slate-400">{row.reason}</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-400">{row.quantity}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(row)}
                                                    className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                    <div className="text-xs text-slate-500">
                        Showing <span className="font-medium text-white">{currentItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-medium text-white">{filteredData.length}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-lg p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">
                                    {editingRecord ? "Edit Scrap Record" : "New Scrap Record"}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-white transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Line</label>
                                    <select
                                        value={formData.line || "Line 1"}
                                        onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    >
                                        <option>Line 1</option>
                                        <option>Line 2</option>
                                        <option>Line 3</option>
                                        <option>Assembly</option>
                                        <option>Packaging</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Defect Type</label>
                                        <select
                                            value={formData.defectType || "Dimensional"}
                                            onChange={(e) => setFormData({ ...formData, defectType: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        >
                                            <option>Dimensional</option>
                                            <option>Material</option>
                                            <option>Assembly</option>
                                            <option>Finishing</option>
                                            <option>Packaging</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={formData.quantity || 0}
                                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Notes</label>
                                    <textarea
                                        value={formData.reason || ""}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition h-20 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-orange-500 text-white rounded-lg hover:bg-orange-400 shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Request"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Scrap;
