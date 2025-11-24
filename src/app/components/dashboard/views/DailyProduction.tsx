import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { exportToCSV } from "@/app/utils/csvExport";
import { Search, Calendar, Filter, Download, ChevronLeft, ChevronRight, ArrowUpRight, Plus, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [line, setLine] = useState("All");
    const [shift, setShift] = useState("All");
    const [product, setProduct] = useState("All");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
    const [formData, setFormData] = useState<Partial<ProductionRecord>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/production?limit=500&offset=0");
            const json = await res.json();
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch (error) {
            console.error("Failed to fetch production data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Data
    const filteredData = data.filter((item) => {
        const itemDate = new Date(item.date);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        const matchesSearch = item.product.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDateFrom = fromDate ? itemDate >= fromDate : true;
        const matchesDateTo = toDate ? itemDate <= toDate : true;
        const matchesLine = line === "All" || item.line === line;
        const matchesShift = shift === "All" || item.shift === shift;
        const matchesProduct = product === "All" || item.product === product;

        return matchesSearch && matchesDateFrom && matchesDateTo && matchesLine && matchesShift && matchesProduct;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
    const filterLines = Array.from(new Set([...data.map(d => d.line), "Line 1", "Line 2", "Line 3", "Assembly", "Packaging"])).sort();
    const filterShifts = Array.from(new Set([...data.map(d => d.shift), "Shift A", "Shift B", "Shift C"])).sort();

    // Handlers
    const openModal = (record?: ProductionRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData(record);
        } else {
            setEditingRecord(null);
            setFormData({
                date: new Date().toISOString().split("T")[0],
                line: "Line 1",
                shift: "Shift A",
                product: "",
                target: 0,
                actual: 0,
                efficiency: 0,
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
            // Calculate efficiency
            const target = Number(formData.target || 0);
            const actual = Number(formData.actual || 0);
            const efficiency = target > 0 ? Math.round((actual / target) * 100) : 0;

            const payload = {
                ...formData,
                target,
                actual,
                efficiency,
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
            };

            let res;
            if (editingRecord) {
                res = await fetch("/api/production", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id: editingRecord.id }),
                });
            } else {
                res = await fetch("/api/production", {
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
                const res = await fetch(`/api/production?id=${id}`, {
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
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 rounded-xl border border-white/10 bg-slate-950/50 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all outline-none"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-1.5">
                                <Calendar size={14} className="text-slate-500" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="bg-transparent text-xs text-white outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                                <span className="text-slate-600">–</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="bg-transparent text-xs text-white outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex gap-2">
                                {[
                                    { label: "Line", value: line, setter: setLine, options: filterLines },
                                    { label: "Shift", value: shift, setter: setShift, options: filterShifts },
                                    { label: "Product", value: product, setter: setProduct, options: uniqueProducts },
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
                                    setDateFrom("");
                                    setDateTo("");
                                    setLine("All");
                                    setShift("All");
                                    setProduct("All");
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "production_data")}
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
            <section className="grid gap-6 md:grid-cols-2">
                {/* Line-wise production */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Line Performance</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Units Produced</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shift-wise comparison */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Shift Analysis</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Units Produced</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={shiftData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Trend chart */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white">Efficiency Trend</h3>
                        <p className="text-xs text-slate-400">7-Day Performance Overview</p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-medium">
                        <ArrowUpRight size={14} />
                        <span>+2.4% vs last week</span>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                            />
                            <Area type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Table */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white">Production Detail</h2>
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
                                <th className="px-6 py-4">Shift</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4 text-right">Target</th>
                                <th className="px-6 py-4 text-right">Actual</th>
                                <th className="px-6 py-4 text-right">Efficiency</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
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
                                        <td className="px-6 py-4">{row.shift}</td>
                                        <td className="px-6 py-4 font-medium text-white">{row.product}</td>
                                        <td className="px-6 py-4 text-right">{row.target}</td>
                                        <td className="px-6 py-4 text-right font-bold text-white">{row.actual}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.efficiency >= 85 ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                                                row.efficiency >= 70 ? 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20' :
                                                    'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20'
                                                }`}>
                                                {row.efficiency}%
                                            </span>
                                        </td>
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
                                    {editingRecord ? "Edit Production Record" : "New Production Record"}
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
                                <div className="grid grid-cols-2 gap-4">
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
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Shift</label>
                                        <select
                                            value={formData.shift || "Shift A"}
                                            onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        >
                                            <option>Shift A</option>
                                            <option>Shift B</option>
                                            <option>Shift C</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Product</label>
                                    <input
                                        type="text"
                                        value={formData.product || ""}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Target</label>
                                        <input
                                            type="number"
                                            value={formData.target || 0}
                                            onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Actual</label>
                                        <input
                                            type="number"
                                            value={formData.actual || 0}
                                            onChange={(e) => setFormData({ ...formData, actual: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
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

export default DailyProduction;
