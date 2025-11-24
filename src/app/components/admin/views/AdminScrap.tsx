import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CSVImporter from "../CSVImporter";

interface ScrapRecord {
    id: number;
    date: string;
    line: string;
    defectType: string;
    quantity: number;
    reason: string;
}

const AdminScrap: React.FC = () => {
    const [records, setRecords] = useState<ScrapRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<ScrapRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<ScrapRecord>>({});
    const [viewingRecord, setViewingRecord] = useState<ScrapRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [lineFilter, setLineFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/scrap?limit=500&offset=0");
            const data = await res.json();
            setRecords(data.data || []);
            setTotalItems(data.total || 0);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch records", error);
            setIsLoading(false);
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
                    record.defectType.toLowerCase().includes(lowerQuery) ||
                    record.reason.toLowerCase().includes(lowerQuery) ||
                    record.line.toLowerCase().includes(lowerQuery)
            );
        }

        if (lineFilter !== "All") {
            result = result.filter((record) => record.line === lineFilter);
        }

        if (startDate) {
            result = result.filter((record) => new Date(record.date) >= new Date(startDate));
        }

        if (endDate) {
            result = result.filter((record) => new Date(record.date) <= new Date(endDate));
        }

        setFilteredRecords(result);
        setCurrentPage(1);
    }, [records, searchQuery, lineFilter, startDate, endDate]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const openDetails = (record: ScrapRecord) => {
        setViewingRecord(record);
        setIsDetailsOpen(true);
    };

    const handleSave = async () => {
        try {
            const method = currentRecord.id ? "PUT" : "POST";
            const res = await fetch("/api/scrap", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentRecord),
            });

            const data = await res.json();

            if (data.pending) {
                alert("Request submitted for approval!");
            } else if (res.ok) {
                fetchRecords();
            }
            setIsModalOpen(false);
            setCurrentRecord({});
        } catch (error) {
            console.error("Failed to save record", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await fetch(`/api/scrap?id=${id}`, { method: "DELETE" });
                const data = await res.json();

                if (data.pending) {
                    alert("Delete request submitted for approval!");
                } else {
                    fetchRecords();
                }
            } catch (error) {
                console.error("Failed to delete record", error);
            }
        }
    };

    const handleImport = async (data: any[]) => {
        setIsLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of data) {
            try {
                if (!row.defectType || !row.line) continue;

                const res = await fetch("/api/scrap", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...row,
                        quantity: Number(row.quantity || 0),
                        date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
                    }),
                });

                if (res.ok) successCount++;
                else failCount++;
            } catch (error) {
                failCount++;
            }
        }

        setIsLoading(false);
        if (successCount > 0) {
            await fetchRecords();
        }
        alert(`Import completed. Success: ${successCount}, Failed: ${failCount}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                    <h2 className="text-xl font-semibold text-slate-200">Scrap Management</h2>
                </div>
                <div className="flex gap-3">
                    <CSVImporter
                        templateHeaders={["date", "line", "defectType", "quantity", "reason"]}
                        onImport={handleImport}
                    />
                    <button
                        onClick={() => {
                            setCurrentRecord({});
                            setIsModalOpen(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
                    >
                        + Add Scrap Record
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                <div className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search scrap records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                </div>
                <div>
                    <select
                        value={lineFilter}
                        onChange={(e) => setLineFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    >
                        <option value="All">All Lines</option>
                        <option value="Line 1">Line 1</option>
                        <option value="Line 2">Line 2</option>
                        <option value="Line 3">Line 3</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:border-orange-500 outline-none transition"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:border-orange-500 outline-none transition"
                        placeholder="End Date"
                    />
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

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/80 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Line</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Defect Type</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Quantity</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Reason</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <p className="text-sm">No scrap records found.</p>
                                    <p className="text-xs mt-1 text-slate-600">Add a new record to track defects.</p>
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-slate-300">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-300">{record.line}</td>
                                    <td className="px-6 py-4 font-medium text-orange-300/90 group-hover:text-orange-200">{record.defectType}</td>
                                    <td className="px-6 py-4 text-right text-red-400 font-bold">{record.quantity}</td>
                                    <td className="px-6 py-4 max-w-xs truncate text-slate-400">{record.reason}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openDetails(record)}
                                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                                            title="View Details"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentRecord(record);
                                                setIsModalOpen(true);
                                            }}
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
                            ))
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

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                            <h3 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2">
                                {currentRecord.id ? "Edit Record" : "New Scrap Record"}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Line</label>
                                    <select
                                        value={currentRecord.line || "Line 1"}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, line: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                    >
                                        <option value="Line 1">Line 1</option>
                                        <option value="Line 2">Line 2</option>
                                        <option value="Line 3">Line 3</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Defect Type</label>
                                    <input
                                        type="text"
                                        value={currentRecord.defectType || ""}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, defectType: e.target.value })}
                                        placeholder="e.g., Dent, Scratch"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Quantity</label>
                                    <input
                                        type="number"
                                        value={currentRecord.quantity || 0}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, quantity: Number(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Reason / Notes</label>
                                    <textarea
                                        value={currentRecord.reason || ""}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, reason: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition h-24"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition"
                                >
                                    Save Record
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                        <h3 className="text-xl font-bold text-slate-100">{viewingRecord.defectType}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{new Date(viewingRecord.date).toLocaleDateString()}</p>
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
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Line</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.line}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Quantity</p>
                                        <p className="text-xl font-bold text-red-400 mt-1">{viewingRecord.quantity}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reason / Notes</p>
                                        <p className="text-sm text-slate-300 mt-1 bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                                            {viewingRecord.reason}
                                        </p>
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

export default AdminScrap;
