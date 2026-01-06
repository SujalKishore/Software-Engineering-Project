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
    Legend,
} from "recharts";
import { exportToCSV } from "@/app/utils/csvExport";
import { Search, Filter, Download, ChevronLeft, ChevronRight, AlertTriangle, Package, Plus, Edit, Trash2, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
    id: string;
    code: string;
    name: string;
    type: string;
    category: string;
    location: string;
    stockQty: number;
    uom: string;
    safetyStock: number;
    reorderLevel: number;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

const Inventory: React.FC = () => {
    const [data, setData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [stockStatus, setStockStatus] = useState("All"); // All, Low Stock, Adequate

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/inventory?limit=500&offset=0");
            const json = await res.json();
            setData(json.data || []);
            setTotal(json.total || 0);
        } catch (error) {
            console.error("Failed to fetch inventory data", error);
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
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "All" || item.type === typeFilter;
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

        let matchesStock = true;
        if (stockStatus === "Low Stock") {
            matchesStock = item.stockQty <= item.safetyStock;
        } else if (stockStatus === "Adequate") {
            matchesStock = item.stockQty > item.safetyStock;
        }

        return matchesSearch && matchesType && matchesCategory && matchesStock;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // 1. Stock by Category (Pie Chart)
    const uniqueCategories = Array.from(new Set(data.map(d => d.category)));
    const categoryData = uniqueCategories.map(c => {
        const count = data.filter(d => d.category === c).length;
        return { name: c, value: count };
    });

    // 2. Low Stock Items (Top 5)
    const lowStockItems = data
        .filter(item => item.stockQty <= item.safetyStock)
        .sort((a, b) => (a.stockQty / a.safetyStock) - (b.stockQty / b.safetyStock))
        .slice(0, 5);

    // 3. Stock Value by Type (Mock Value = Qty * 100 for demo)
    const uniqueTypes = Array.from(new Set(data.map(d => d.type)));
    const valueByTypeData = uniqueTypes.map(t => {
        const totalValue = data
            .filter(d => d.type === t)
            .reduce((sum, d) => sum + (d.stockQty * 100), 0); // Assuming avg price 100
        return { name: t, value: totalValue };
    });

    // Unique options
    const filterTypes = Array.from(new Set(data.map(d => d.type))).sort();
    const filterCategories = Array.from(new Set(data.map(d => d.category))).sort();

    // Handlers
    const openModal = (record?: InventoryItem) => {
        if (record) {
            setEditingRecord(record);
            setFormData(record);
        } else {
            setEditingRecord(null);
            setFormData({
                code: `ITEM-${Math.floor(Math.random() * 10000)}`,
                name: "",
                type: "Raw Material",
                category: "General",
                location: "Warehouse A",
                stockQty: 0,
                uom: "pcs",
                safetyStock: 0,
                reorderLevel: 0,
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
                stockQty: Number(formData.stockQty || 0),
                safetyStock: Number(formData.safetyStock || 0),
                reorderLevel: Number(formData.reorderLevel || 0),
            };

            let res;
            if (editingRecord) {
                res = await fetch("/api/inventory", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id: editingRecord.id }),
                });
            } else {
                res = await fetch("/api/inventory", {
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
                const res = await fetch(`/api/inventory?id=${id}`, {
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
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 rounded-xl border border-white/10 bg-slate-950/50 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all outline-none"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex gap-2">
                                {[
                                    { label: "Type", value: typeFilter, setter: setTypeFilter, options: filterTypes },
                                    { label: "Category", value: categoryFilter, setter: setCategoryFilter, options: filterCategories },
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
                                <div className="relative">
                                    <select
                                        value={stockStatus}
                                        onChange={(e) => setStockStatus(e.target.value)}
                                        className="appearance-none rounded-xl border border-white/10 bg-slate-950/50 pl-3 pr-8 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:bg-slate-900"
                                    >
                                        <option>All</option>
                                        <option>Low Stock</option>
                                        <option>Adequate</option>
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setTypeFilter("All");
                                    setCategoryFilter("All");
                                    setStockStatus("All");
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => exportToCSV(data, "inventory_data")}
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
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="grid gap-6 md:grid-cols-3">
                {/* Category Distribution */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Category Distribution</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Items</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Legend
                                    iconSize={8}
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Low Stock Alerts</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-red-400 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Critical
                        </span>
                    </div>
                    <div className="space-y-3">
                        {lowStockItems.length === 0 ? (
                            <div className="text-center text-xs text-slate-500 py-8">All stock levels adequate.</div>
                        ) : (
                            lowStockItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div>
                                        <div className="text-xs font-bold text-slate-200">{item.name}</div>
                                        <div className="text-[10px] text-slate-400">Code: {item.code}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-red-400">{item.stockQty} {item.uom}</div>
                                        <div className="text-[10px] text-slate-500">Min: {item.safetyStock}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Value by Type */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Stock Value</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">By Type</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={valueByTypeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.5} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Table */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white">Inventory Detail</h2>
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
                                <th className="px-6 py-4">Item Code</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Stock Qty</th>
                                <th className="px-6 py-4 text-right">Status</th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 text-purple-400">
                                        <Sparkles size={12} />
                                        Predictive Demand
                                    </div>
                                </th>
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
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.code}</td>
                                        <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                                        <td className="px-6 py-4">{row.type}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                                                {row.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{row.location}</td>
                                        <td className="px-6 py-4 text-right font-bold text-white">
                                            {row.stockQty} <span className="text-slate-500 font-normal text-[10px]">{row.uom}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.stockQty <= row.safetyStock
                                                ? 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
                                                }`}>
                                                {row.stockQty <= row.safetyStock ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Simulated AI Prediction */}
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] === 'High' ? 'text-red-400' :
                                                    ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>
                                                {['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]}
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
                                    {editingRecord ? "Edit Inventory Item" : "New Inventory Item"}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-white transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Item Code</label>
                                    <input
                                        type="text"
                                        value={formData.code || ""}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                                        <select
                                            value={formData.type || "Raw Material"}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        >
                                            <option>Raw Material</option>
                                            <option>Finished Goods</option>
                                            <option>Consumable</option>
                                            <option>Spare Part</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                                        <input
                                            type="text"
                                            value={formData.category || ""}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location || ""}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">UOM</label>
                                        <input
                                            type="text"
                                            value={formData.uom || ""}
                                            onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Stock Qty</label>
                                        <input
                                            type="number"
                                            value={formData.stockQty || 0}
                                            onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Safety Stock</label>
                                        <input
                                            type="number"
                                            value={formData.safetyStock || 0}
                                            onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Reorder Lvl</label>
                                        <input
                                            type="number"
                                            value={formData.reorderLevel || 0}
                                            onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
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

export default Inventory;
