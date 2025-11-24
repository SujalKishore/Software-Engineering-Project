import React, { useEffect, useState } from "react";
import { Order } from "@/app/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import CSVImporter from "../CSVImporter";

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [formData, setFormData] = useState<Partial<Order>>({});
    const [loading, setLoading] = useState(false);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [customerFilter, setCustomerFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetching all for client-side filtering for now
            const res = await fetch(`/api/orders?limit=500&offset=0`);
            const data = await res.json();
            setOrders(data.data || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (order) =>
                    order.orderId.toLowerCase().includes(lowerQuery) ||
                    order.customer.toLowerCase().includes(lowerQuery) ||
                    order.product.toLowerCase().includes(lowerQuery)
            );
        }

        if (statusFilter !== "All") {
            result = result.filter((order) => order.status === statusFilter);
        }

        if (customerFilter !== "All") {
            result = result.filter((order) => order.customer === customerFilter);
        }

        if (startDate) {
            result = result.filter((order) => new Date(order.bookedOn) >= new Date(startDate));
        }

        if (endDate) {
            result = result.filter((order) => new Date(order.bookedOn) <= new Date(endDate));
        }

        setFilteredOrders(result);
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [orders, searchQuery, statusFilter, customerFilter, startDate, endDate]);

    // Unique Customers for Filter
    const uniqueCustomers = Array.from(new Set(orders.map(o => o.customer))).sort();

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handleSave = async () => {
        setLoading(true);
        try {
            let res;
            if (editingOrder) {
                res = await fetch("/api/orders", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingOrder.id }),
                });
            } else {
                res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            const data = await res.json();

            if (data.pending) {
                alert("Request submitted for approval!");
            } else {
                await fetchOrders();
            }
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
                const res = await fetch(`/api/orders?id=${id}`, {
                    method: "DELETE",
                });
                const data = await res.json();

                if (data.pending) {
                    alert("Delete request submitted for approval!");
                } else {
                    await fetchOrders();
                }
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

    const openDetails = (order: Order) => {
        setViewingOrder(order);
        setIsDetailsOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOrder(null);
        setFormData({});
    };

    const handleImport = async (data: any[]) => {
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of data) {
            try {
                if (!row.orderId || !row.customer) continue;

                const res = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...row,
                        orderQty: Number(row.orderQty || 0),
                        bookedOn: row.bookedOn ? new Date(row.bookedOn).toISOString() : new Date().toISOString(),
                        dueDate: row.dueDate ? new Date(row.dueDate).toISOString() : new Date().toISOString(),
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
            await fetchOrders();
        }
        alert(`Import completed. Success: ${successCount}, Failed: ${failCount}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <span className="text-2xl">🛒</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Customer Orders</h2>
                        <p className="text-xs text-slate-400">Manage and track all customer orders</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <CSVImporter
                        templateHeaders={["orderId", "customer", "region", "product", "orderQty", "bookedOn", "dueDate", "status", "dispatchStatus"]}
                        onImport={handleImport}
                    />
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <span>+</span> New Order
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                <div className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <select
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                    >
                        <option value="All">All Customers</option>
                        {uniqueCustomers.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:border-blue-500 outline-none transition"
                        placeholder="End Date"
                    />
                </div>
                <div>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50 shadow-xl">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/80 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Qty</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    Loading orders...
                                </td>
                            </tr>
                        ) : currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No orders found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-blue-300/90 group-hover:text-blue-200">{order.orderId}</td>
                                    <td className="px-6 py-4 text-slate-300">{order.customer}</td>
                                    <td className="px-6 py-4 text-slate-400">{order.product}</td>
                                    <td className="px-6 py-4 text-slate-400">{order.orderQty}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${order.status === "Completed"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : order.status === "Cancelled"
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openDetails(order)}
                                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                                            title="View Details"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            onClick={() => openModal(order)}
                                            className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center text-xs text-slate-400">
                <div>
                    Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
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
                        // Simple pagination logic to show limited page numbers
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                        }
                        if (pageNum > totalPages) return null;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1.5 rounded-md border ${currentPage === pageNum ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-800 hover:bg-slate-800'} transition`}
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

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden"
                        >
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Details Modal */}
            <AnimatePresence>
                {isDetailsOpen && viewingOrder && (
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
                                        <h3 className="text-xl font-bold text-slate-100">{viewingOrder.orderId}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{viewingOrder.customer}</p>
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
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Product</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingOrder.product}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quantity</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingOrder.orderQty}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Region</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingOrder.region}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${viewingOrder.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                                            {viewingOrder.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Booked On</p>
                                        <p className="text-sm text-slate-200 mt-1">{new Date(viewingOrder.bookedOn).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Due Date</p>
                                        <p className="text-sm text-slate-200 mt-1">{new Date(viewingOrder.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Dispatch Status</p>
                                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                                        <p className="text-sm text-slate-300">{viewingOrder.dispatchStatus || "Not Dispatched"}</p>
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

export default AdminOrders;
