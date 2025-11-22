import React, { useEffect, useState } from "react";
import { Order } from "@/app/lib/mockData";

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [formData, setFormData] = useState<Partial<Order>>({});
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editingOrder) {
                await fetch("/api/orders", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingOrder.id }),
                });
            } else {
                await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }
            await fetchOrders();
            closeModal();
        } catch (error) {
            console.error("Failed to save order", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this order?")) {
            try {
                await fetch(`/api/orders?id=${id}`, {
                    method: "DELETE",
                });
                await fetchOrders();
            } catch (error) {
                console.error("Failed to delete order", error);
            }
        }
    };

    const openModal = (order?: Order) => {
        if (order) {
            setEditingOrder(order);
            setFormData(order);
        } else {
            setEditingOrder(null);
            setFormData({
                orderId: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                customer: "",
                region: "North",
                product: "",
                orderQty: 0,
                bookedOn: new Date().toISOString().split("T")[0],
                dueDate: "",
                status: "Open",
                dispatchStatus: "Not Dispatched",
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOrder(null);
        setFormData({});
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                        Customer Orders
                    </h2>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-blue-600/20"
                >
                    + New Order
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/50 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-blue-300/90">{order.orderId}</td>
                                <td className="px-6 py-4 text-slate-300">{order.customer}</td>
                                <td className="px-6 py-4 text-slate-400">{order.product}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded-md text-xs font-medium border ${order.status === "Completed"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : order.status === "Cancelled"
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => openModal(order)}
                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition uppercase tracking-wide"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="text-xs font-medium text-red-400 hover:text-red-300 transition uppercase tracking-wide"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <p className="text-sm">No orders found.</p>
                                    <p className="text-xs mt-1 text-slate-600">Create a new order to get started.</p>
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
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <h3 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                            {editingOrder ? "Edit Order" : "New Order"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Order ID</label>
                                    <input
                                        type="text"
                                        value={formData.orderId || ""}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Customer</label>
                                    <input
                                        type="text"
                                        value={formData.customer || ""}
                                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Region</label>
                                    <select
                                        value={formData.region || "North"}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    >
                                        <option>North</option>
                                        <option>South</option>
                                        <option>East</option>
                                        <option>West</option>
                                        <option>Export</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Product</label>
                                    <input
                                        type="text"
                                        value={formData.product || ""}
                                        onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Order Qty</label>
                                    <input
                                        type="number"
                                        value={formData.orderQty || 0}
                                        onChange={(e) => setFormData({ ...formData, orderQty: Number(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Booked On</label>
                                    <input
                                        type="date"
                                        value={formData.bookedOn ? new Date(formData.bookedOn).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, bookedOn: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Status</label>
                                    <select
                                        value={formData.status || "Open"}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                                    >
                                        <option>Open</option>
                                        <option>Completed</option>
                                        <option>Cancelled</option>
                                    </select>
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
                                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
