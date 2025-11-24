import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CSVImporter from "../CSVImporter";

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

const AdminProduction: React.FC = () => {
    const [records, setRecords] = useState<ProductionRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<ProductionRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<ProductionRecord>>({});
    const [viewingRecord, setViewingRecord] = useState<ProductionRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [lineFilter, setLineFilter] = useState("All");
    const [shiftFilter, setShiftFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/production?limit=500&offset=0");
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
                    record.product.toLowerCase().includes(lowerQuery) ||
                    record.line.toLowerCase().includes(lowerQuery)
            );
        }

        if (lineFilter !== "All") {
            result = result.filter((record) => record.line === lineFilter);
        }

        if (shiftFilter !== "All") {
            result = result.filter((record) => record.shift === shiftFilter);
        }

        if (startDate) {
            result = result.filter((record) => new Date(record.date) >= new Date(startDate));
        }

        if (endDate) {
            result = result.filter((record) => new Date(record.date) <= new Date(endDate));
        }

        setFilteredRecords(result);
        setCurrentPage(1);
    }, [records, searchQuery, lineFilter, shiftFilter, startDate, endDate]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const openDetails = (record: ProductionRecord) => {
        setViewingRecord(record);
        setIsDetailsOpen(true);
    };

    const handleSave = async () => {
        try {
            const method = currentRecord.id ? "PUT" : "POST";
            const res = await fetch("/api/production", {
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
                const res = await fetch(`/api/production?id=${id}`, { method: "DELETE" });
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
                if (!row.product || !row.line) continue;

                const target = Number(row.target || 0);
                const actual = Number(row.actual || 0);
                const efficiency = target > 0 ? Math.round((actual / target) * 100) : 0;

                const res = await fetch("/api/production", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...row,
                        target,
                        actual,
                        efficiency,
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
                    <h2 className="text-xl font-semibold text-slate-200">Daily Production</h2>
                </div>
                <div className="flex gap-3">
                    <CSVImporter
                        templateHeaders={["date", "line", "shift", "product", "target", "actual"]}
                        onImport={handleImport}
                    />
                    <button
                        onClick={() => {
                            setCurrentRecord({});
                            setIsModalOpen(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
                    >
                        + Add Record
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                <div className="md:col-span-2 relative">
                    <input
                        type="text"
                        placeholder="Search production records..."
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
                <div>
                    <select
                        value={shiftFilter}
                        onChange={(e) => setShiftFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                    >
                        <option value="All">All Shifts</option>
                        <option value="A">Shift A</option>
                        <option value="B">Shift B</option>
                        <option value="C">Shift C</option>
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
                <div className="flex gap-2 md:col-span-2">
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
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/80 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Line</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Shift</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Product</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Target</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actual</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Eff %</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                    <p className="text-sm">No production records found.</p>
                                    <p className="text-xs mt-1 text-slate-600">Add a new record to get started.</p>
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-slate-300">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-300">{record.line}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-400 border border-slate-700">
                                            {record.shift}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-orange-300/90 group-hover:text-orange-200">{record.product}</td>
                                    <td className="px-6 py-4 text-right text-slate-400">{record.target}</td>
                                    <td className="px-6 py-4 text-right text-slate-200 font-medium">{record.actual}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${record.efficiency >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            record.efficiency >= 80 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {record.efficiency}%
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
                                {currentRecord.id ? "Edit Record" : "New Production Record"}
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Shift</label>
                                        <select
                                            value={currentRecord.shift || "A"}
                                            onChange={(e) => setCurrentRecord({ ...currentRecord, shift: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                        >
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Product</label>
                                        <input
                                            type="text"
                                            value={currentRecord.product || ""}
                                            onChange={(e) => setCurrentRecord({ ...currentRecord, product: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Target</label>
                                        <input
                                            type="number"
                                            value={currentRecord.target || 0}
                                            onChange={(e) => setCurrentRecord({ ...currentRecord, target: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Actual</label>
                                        <input
                                            type="number"
                                            value={currentRecord.actual || 0}
                                            onChange={(e) => {
                                                const actual = Number(e.target.value);
                                                const target = currentRecord.target || 1;
                                                const efficiency = Math.round((actual / target) * 100);
                                                setCurrentRecord({ ...currentRecord, actual, efficiency });
                                            }}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Efficiency (%)</label>
                                    <input
                                        type="number"
                                        readOnly
                                        value={currentRecord.efficiency || 0}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
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
                                        <h3 className="text-xl font-bold text-slate-100">{viewingRecord.product}</h3>
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
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Shift</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.shift}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Target</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.target}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actual</p>
                                        <p className="text-sm text-slate-200 mt-1">{viewingRecord.actual}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Efficiency</p>
                                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full ${viewingRecord.efficiency >= 90 ? 'bg-emerald-500' : viewingRecord.efficiency >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(viewingRecord.efficiency, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-slate-200 mt-1 text-right">{viewingRecord.efficiency}%</p>
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

export default AdminProduction;
