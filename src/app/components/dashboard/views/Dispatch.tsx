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
import { Search, Calendar, Filter, Download, ChevronLeft, ChevronRight, Truck, Plus, Edit, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DispatchRecord {
    id: string;
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
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [regionFilter, setRegionFilter] = useState("All");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DispatchRecord | null>(null);
    const [formData, setFormData] = useState<Partial<DispatchRecord>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/dispatch?limit=500&offset=0");
            const json = await res.json();
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch (error) {
            console.error("Failed to fetch dispatch data", error);
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
            item.lrNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.transporter.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = dateFilter ? item.date.startsWith(dateFilter) : true;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        const matchesRegion = regionFilter === "All" || item.region === regionFilter;

        return matchesSearch && matchesDate && matchesStatus && matchesRegion;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // 1. Dispatch by Region (Bar Chart)
    const uniqueRegions = Array.from(new Set(data.map(d => d.region)));
    const regionData = uniqueRegions.map(r => {
        const count = filteredData.filter(d => d.region === r).length;
        return { name: r, value: count };
    });

    // 2. Status Distribution
    const statusCounts = {
        "In Transit": filteredData.filter(d => d.status === "In Transit").length,
        "Delivered": filteredData.filter(d => d.status === "Delivered").length,
        "Delayed": filteredData.filter(d => d.status === "Delayed").length,
    };

    // 3. Daily Dispatch Trend (Cartons)
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
        const dayCartons = data
            .filter(item => item.date.startsWith(dateStr))
            .reduce((sum, item) => sum + item.cartons, 0);
        return { name: dateStr, cartons: dayCartons };
    });

    // Unique options
    const uniqueRegionsFilter = Array.from(new Set(data.map(d => d.region))).sort();

    // Handlers
    const openModal = (record?: DispatchRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData(record);
        } else {
            setEditingRecord(null);
            setFormData({
                lrNo: `LR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                date: new Date().toISOString().split("T")[0],
                customer: "",
                region: "North",
                transporter: "",
                truckNo: "",
                route: "",
                cartons: 0,
                status: "In Transit",
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
                cartons: Number(formData.cartons || 0),
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
            };

            let res;
            if (editingRecord) {
                res = await fetch("/api/dispatch", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id: editingRecord.id }),
                });
            } else {
                res = await fetch("/api/dispatch", {
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

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record? This action will create a request for admin approval.")) {
            try {
                const res = await fetch(`/api/dispatch?id=${id}`, {
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
                                    placeholder="Search LR, Customer..."
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
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="appearance-none rounded-xl border border-white/10 bg-slate-950/50 pl-3 pr-8 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:bg-slate-900"
                                    >
                                        <option>All</option>
                                        <option>In Transit</option>
                                        <option>Delivered</option>
                                        <option>Delayed</option>
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                                </div>
                                <div className="relative">
                                    <select
                                        value={regionFilter}
                                        onChange={(e) => setRegionFilter(e.target.value)}
                                        className="appearance-none rounded-xl border border-white/10 bg-slate-950/50 pl-3 pr-8 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:bg-slate-900"
                                    >
                                        <option>All</option>
                                        {uniqueRegionsFilter.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setDateFilter("");
                                    setStatusFilter("All");
                                    setRegionFilter("All");
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "dispatch_data")}
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
                {/* Status Cards */}
                <div className="grid grid-rows-3 gap-4">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">In Transit</p>
                            <p className="text-xl font-bold text-blue-400">{statusCounts["In Transit"]}</p>
                        </div>
                        <Truck className="text-blue-500/20" size={32} />
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">Delivered</p>
                            <p className="text-xl font-bold text-emerald-400">{statusCounts["Delivered"]}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">✓</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">Delayed</p>
                            <p className="text-xl font-bold text-red-400">{statusCounts["Delayed"]}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">!</div>
                    </div>
                </div>

                {/* Dispatch by Region */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Regional Dispatch</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Shipments</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Dispatch Trend</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Cartons</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Line type="monotone" dataKey="cartons" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#fff" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white">Dispatch Detail</h2>
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
                                <th className="px-6 py-4">LR No.</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Region</th>
                                <th className="px-6 py-4">Transporter</th>
                                <th className="px-6 py-4 text-right">Cartons</th>
                                <th className="px-6 py-4">Status</th>
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
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.lrNo}</td>
                                        <td className="px-6 py-4 text-slate-300">{new Date(row.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-white">{row.customer}</td>
                                        <td className="px-6 py-4">{row.region}</td>
                                        <td className="px-6 py-4 text-slate-400">{row.transporter}</td>
                                        <td className="px-6 py-4 text-right font-bold text-white">{row.cartons}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.status === "Delivered" ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                                                row.status === "Delayed" ? 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20' :
                                                    'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20'
                                                }`}>
                                                {row.status}
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
                                    {editingRecord ? "Edit Dispatch Record" : "New Dispatch Record"}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-white transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">LR No.</label>
                                    <input
                                        type="text"
                                        value={formData.lrNo || ""}
                                        onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
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
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Customer</label>
                                    <input
                                        type="text"
                                        value={formData.customer || ""}
                                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Region</label>
                                        <select
                                            value={formData.region || "North"}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        >
                                            <option>North</option>
                                            <option>South</option>
                                            <option>East</option>
                                            <option>West</option>
                                            <option>Export</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                                        <select
                                            value={formData.status || "In Transit"}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        >
                                            <option>In Transit</option>
                                            <option>Delivered</option>
                                            <option>Delayed</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Transporter</label>
                                    <input
                                        type="text"
                                        value={formData.transporter || ""}
                                        onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Truck No.</label>
                                        <input
                                            type="text"
                                            value={formData.truckNo || ""}
                                            onChange={(e) => setFormData({ ...formData, truckNo: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Cartons</label>
                                        <input
                                            type="number"
                                            value={formData.cartons || 0}
                                            onChange={(e) => setFormData({ ...formData, cartons: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Route</label>
                                    <input
                                        type="text"
                                        value={formData.route || ""}
                                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
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

export default Dispatch;
