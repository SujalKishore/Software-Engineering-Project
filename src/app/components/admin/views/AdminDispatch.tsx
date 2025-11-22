import React, { useEffect, useState } from "react";
import { DispatchRecord } from "@/app/lib/mockData";

const AdminDispatch: React.FC = () => {
    const [records, setRecords] = useState<DispatchRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DispatchRecord | null>(null);
    const [formData, setFormData] = useState<Partial<DispatchRecord>>({});
    const [loading, setLoading] = useState(false);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/dispatch");
            const data = await res.json();
            setRecords(data);
        } catch (error) {
            console.error("Failed to fetch dispatch records", error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editingRecord) {
                await fetch("/api/dispatch", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, id: editingRecord.id }),
                });
            } else {
                await fetch("/api/dispatch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }
            await fetchRecords();
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
                await fetch(`/api/dispatch?id=${id}`, {
                    method: "DELETE",
                });
                await fetchRecords();
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                        Dispatch Records
                    </h2>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-600/20"
                >
                    + Add Record
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/50">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-200 uppercase bg-slate-950/50 border-b border-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">LR No.</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {records.map((record) => (
                            <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-emerald-300/90">{record.lrNo}</td>
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
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => openModal(record)}
                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition uppercase tracking-wide"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id)}
                                        className="text-xs font-medium text-red-400 hover:text-red-300 transition uppercase tracking-wide"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {records.length === 0 && (
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
        </div>
    );
};

export default AdminDispatch;
