import React, { useEffect, useState } from "react";
import { InventoryItem } from "@/app/lib/mockData"; // Keep type for now

const AdminInventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<Partial<InventoryItem>>({});
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        try {
            const res = await fetch("/api/inventory");
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editingItem) {
                await fetch("/api/inventory", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingItem.id }),
                });
            } else {
                await fetch("/api/inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }
            await fetchItems();
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
                await fetch(`/api/inventory?id=${id}`, {
                    method: "DELETE",
                });
                await fetchItems();
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                        Inventory List
                    </h2>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-500/20"
                >
                    + Add Item
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/50 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Code</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-orange-300/90">{item.code}</td>
                                <td className="px-6 py-4 text-slate-300">{item.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-400 border border-slate-700">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                    {item.stockQty} <span className="text-slate-500 text-xs">{item.uom}</span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => openModal(item)}
                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition uppercase tracking-wide"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-xs font-medium text-red-400 hover:text-red-300 transition uppercase tracking-wide"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden">
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInventory;
