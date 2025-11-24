import React, { useEffect, useState } from "react";
import { InventoryItem } from "@/app/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import CSVImporter from "../CSVImporter";

const AdminInventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});
    const [loading, setLoading] = useState(false);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchItems = async () => {
        try {
            const res = await fetch("/api/inventory?limit=500&offset=0");
            const data = await res.json();
            setItems(data.data || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        let result = items;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.code.toLowerCase().includes(lowerQuery) ||
                    item.name.toLowerCase().includes(lowerQuery) ||
                    item.location.toLowerCase().includes(lowerQuery)
            );
        }

        if (typeFilter !== "All") {
            result = result.filter((item) => item.type === typeFilter);
        }

        if (categoryFilter !== "All") {
            result = result.filter((item) => item.category === categoryFilter);
        }

        setFilteredItems(result);
        setCurrentPage(1);
    }, [items, searchQuery, typeFilter, categoryFilter]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const openDetails = (item: InventoryItem) => {
        setViewingItem(item);
        setIsDetailsOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let res;
            if (editingItem) {
                res = await fetch("/api/inventory", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingItem.id }),
                });
            } else {
                res = await fetch("/api/inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            const data = await res.json();

            if (data.pending) {
                alert("Request submitted for approval!");
            } else {
                await fetchItems();
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save item", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                const res = await fetch(`/api/inventory?id=${id}`, {
                    method: "DELETE",
                });
                const data = await res.json();

                if (data.pending) {
                    alert("Delete request submitted for approval!");
                } else {
                    await fetchItems();
                }
            } catch (error) {
                console.error("Failed to delete item", error);
            }
        }
    };

    const openModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                code: "",
                name: "",
                type: "Raw Material",
                category: "Raw",
                location: "",
                stockQty: 0,
                uom: "kg",
                safetyStock: 0,
                reorderLevel: 0,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleImport = async (data: any[]) => {
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of data) {
            try {
                // Basic validation/transformation if needed
                if (!row.code || !row.name) continue;

                const res = await fetch("/api/inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...row,
                        stockQty: Number(row.stockQty || 0),
                        safetyStock: Number(row.safetyStock || 0),
                        reorderLevel: Number(row.reorderLevel || 0),
                    }),
                });

                if (res.ok) successCount++;
                else failCount++;
            } catch (error) {
                failCount++;
            }
        }

        setLoading(false);
        if (successCount > 0) {
            await fetchItems();
        }
        alert(`Import completed. Success: ${successCount}, Failed: ${failCount}`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                        Inventory List
                    </h2>
                </div>
                <div className="flex gap-3">
                    <CSVImporter
                        templateHeaders={["code", "name", "type", "category", "location", "stockQty", "uom", "safetyStock", "reorderLevel"]}
                        onImport={handleImport}
                    />
                    <button
                        onClick={() => openModal()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-500/20"
                    >
                        + Add Item
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                </div>
                <div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    >
                        <option value="All">All Types</option>
                        <option value="Raw Material">Raw Material</option>
                        <option value="WIP">WIP</option>
                        <option value="Finished Goods">Finished Goods</option>
                    </select>
                </div>
                <div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    >
                        <option value="All">All Categories</option>
                        <option value="Raw">Raw</option>
                        <option value="WIP">WIP</option>
                        <option value="FG">FG</option>
                    </select>
                </div>
                <div>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50 shadow-xl">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/80 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Code</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {currentItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4 font-medium text-orange-300/90 group-hover:text-orange-200">{item.code}</td>
                                <td className="px-6 py-4 text-slate-300">{item.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-400 border border-slate-700">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {item.stockQty} <span className="text-slate-500 text-xs">{item.uom}</span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openDetails(item)}
                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                                        title="View Details"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={() => openModal(item)}
                                        className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <p className="text-sm">No inventory items found.</p>
                                    <p className="text-xs mt-1 text-slate-600">Add a new item to get started.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center text-xs text-slate-400 mt-4">
                <div>
                    Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} entries
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-md border border-slate-800 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                        }
                        if (pageNum > totalPages) return null;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1.5 rounded-md border ${currentPage === pageNum ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-800 hover:bg-slate-800'} transition`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1.5 rounded-md border border-slate-800 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-blue-500"></div>
                            <h3 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                                {editingItem ? "Edit Item" : "Add New Item"}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Code</label>
                                        <input
                                            type="text"
                                            value={formData.code || ""}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                            placeholder="e.g. RM-STEEL-01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                            placeholder="Item Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Type</label>
                                        <select
                                            value={formData.type || "Raw Material"}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                        >
                                            <option>Raw Material</option>
                                            <option>WIP</option>
                                            <option>Finished Goods</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Category</label>
                                        <select
                                            value={formData.category || "Raw"}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                        >
                                            <option>Raw</option>
                                            <option>WIP</option>
                                            <option>FG</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location || ""}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                            placeholder="Warehouse Location"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Stock Qty</label>
                                            <input
                                                type="number"
                                                value={formData.stockQty || 0}
                                                onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">UoM</label>
                                            <input
                                                type="text"
                                                value={formData.uom || ""}
                                                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                                placeholder="kg, pcs, etc."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Safety Stock</label>
                                            <input
                                                type="number"
                                                value={formData.safetyStock || 0}
                                                onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Reorder Level</label>
                                            <input
                                                type="number"
                                                value={formData.reorderLevel || 0}
                                                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Item"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Details Modal */}
            <AnimatePresence>
                {isDetailsOpen && viewingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg p-0 shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-100">{viewingItem.name}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{viewingItem.code}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsDetailsOpen(false)}
                                        className="text-slate-400 hover:text-slate-200 transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingItem.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingItem.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingItem.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stock</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingItem.stockQty} {viewingItem.uom}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Safety Stock</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingItem.safetyStock}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reorder Level</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingItem.reorderLevel}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={() => setIsDetailsOpen(false)}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminInventory;
