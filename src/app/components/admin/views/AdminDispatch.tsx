import React, { useEffect, useState } from "react";
import { DispatchRecord } from "@/app/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";
import CSVImporter from "../CSVImporter";

const AdminDispatch: React.FC = () => {
    const [records, setRecords] = useState<DispatchRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<DispatchRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DispatchRecord | null>(null);
    const [viewingRecord, setViewingRecord] = useState<DispatchRecord | null>(null);
    const [formData, setFormData] = useState<Partial<DispatchRecord>>({});
    const [loading, setLoading] = useState(false);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/dispatch?limit=500&offset=0");
            const data = await res.json();
            setRecords(data.data || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch dispatch records", error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        let result = records;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (record) =>
                    record.lrNo.toLowerCase().includes(lowerQuery) ||
                    record.customer.toLowerCase().includes(lowerQuery) ||
                    record.transporter.toLowerCase().includes(lowerQuery)
            );
        }

        if (statusFilter !== "All") {
            result = result.filter((record) => record.status === statusFilter);
        }

        if (startDate) {
            result = result.filter((record) => new Date(record.date) >= new Date(startDate));
        }

        if (endDate) {
            result = result.filter((record) => new Date(record.date) <= new Date(endDate));
        }

        setFilteredRecords(result);
        setCurrentPage(1);
    }, [records, searchQuery, statusFilter, startDate, endDate]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const openDetails = (record: DispatchRecord) => {
        setViewingRecord(record);
        setIsDetailsOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            let res;
            if (editingRecord) {
                res = await fetch("/api/dispatch", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingRecord.id }),
                });
            } else {
                res = await fetch("/api/dispatch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            const data = await res.json();

            if (data.pending) {
                alert("Request submitted for approval!");
            } else {
                await fetchRecords();
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save record", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await fetch(`/api/dispatch?id=${id}`, {
                    method: "DELETE",
                });
                const data = await res.json();

                if (data.pending) {
                    alert("Delete request submitted for approval!");
                } else {
                    await fetchRecords();
                }
            } catch (error) {
                console.error("Failed to delete record", error);
            }
        }
    };

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

    const handleImport = async (data: any[]) => {
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of data) {
            try {
                if (!row.lrNo || !row.customer) continue;

                const res = await fetch("/api/dispatch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...row,
                        cartons: Number(row.cartons || 0),
                        date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
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
            await fetchRecords();
        }
        alert(`Import completed. Success: ${successCount}, Failed: ${failCount}`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                        Dispatch Records
                    </h2>
                </div>
                <div className="flex gap-3">
                    <CSVImporter
                        templateHeaders={["lrNo", "date", "customer", "region", "transporter", "truckNo", "route", "cartons", "status"]}
                        onImport={handleImport}
                    />
                    <button
                        onClick={() => openModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-600/20"
                    >
                        + Add Record
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 mb-6">
                <div className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search dispatch records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                    >
                        <option value="All">All Statuses</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Delayed">Delayed</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none transition"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:border-emerald-500 outline-none transition"
                        placeholder="End Date"
                    />
                </div>
                <div>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
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
                            <th className="px-6 py-4 font-semibold tracking-wider">LR No.</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {currentItems.map((record) => (
                            <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4 font-medium text-emerald-300/90 group-hover:text-emerald-200">{record.lrNo}</td>
                                <td className="px-6 py-4 text-slate-300">{record.date}</td>
                                <td className="px-6 py-4 text-slate-400">{record.customer}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded-md text-xs font-medium border ${record.status === "Delivered"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : record.status === "Delayed"
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}
                                    >
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openDetails(record)}
                                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                                        title="View Details"
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={() => openModal(record)}
                                        className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id)}
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
                                    <p className="text-sm">No dispatch records found.</p>
                                    <p className="text-xs mt-1 text-slate-600">Add a new record to track shipments.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center text-xs text-slate-400 mt-4">
                <div>
                    Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} entries
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
                                className={`px-3 py-1.5 rounded-md border ${currentPage === pageNum ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-800 hover:bg-slate-800'} transition`}
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <h3 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                            {editingRecord ? "Edit Record" : "New Record"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">LR No.</label>
                                    <input
                                        type="text"
                                        value={formData.lrNo || ""}
                                        onChange={(e) => setFormData({ ...formData, lrNo: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Customer</label>
                                    <input
                                        type="text"
                                        value={formData.customer || ""}
                                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Region</label>
                                    <select
                                        value={formData.region || "North"}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    >
                                        <option>North</option>
                                        <option>South</option>
                                        <option>East</option>
                                        <option>West</option>
                                        <option>Export</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Transporter</label>
                                    <input
                                        type="text"
                                        value={formData.transporter || ""}
                                        onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Truck No.</label>
                                    <input
                                        type="text"
                                        value={formData.truckNo || ""}
                                        onChange={(e) => setFormData({ ...formData, truckNo: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Route</label>
                                    <input
                                        type="text"
                                        value={formData.route || ""}
                                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Cartons</label>
                                        <input
                                            type="number"
                                            value={formData.cartons || 0}
                                            onChange={(e) => setFormData({ ...formData, cartons: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Status</label>
                                        <select
                                            value={formData.status || "In Transit"}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition"
                                        >
                                            <option>In Transit</option>
                                            <option>Delivered</option>
                                            <option>Delayed</option>
                                        </select>
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
                                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* View Details Modal */}
            <AnimatePresence>
                {isDetailsOpen && viewingRecord && (
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
                                        <h3 className="text-xl font-bold text-slate-100">{viewingRecord.lrNo}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{viewingRecord.customer}</p>
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
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</p>
                                        <p className="text-sm text-slate-200 mt-1">{new Date(viewingRecord.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${viewingRecord.status === "Delivered"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : viewingRecord.status === "Delayed"
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}>
                                            {viewingRecord.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Transporter</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.transporter}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Truck No.</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.truckNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Route</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.route}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cartons</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.cartons}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Region</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.region}</p>
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

export default AdminDispatch;
