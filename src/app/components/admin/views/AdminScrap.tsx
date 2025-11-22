import React, { useState, useEffect } from "react";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<ScrapRecord>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/scrap");
            const data = await res.json();
            setRecords(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch records", error);
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const method = currentRecord.id ? "PUT" : "POST";
            const res = await fetch("/api/scrap", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentRecord),
            });

            if (res.ok) {
                fetchRecords();
                setIsModalOpen(false);
                setCurrentRecord({});
            }
        } catch (error) {
            console.error("Failed to save record", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this record?")) {
            try {
                await fetch(`/api/scrap?id=${id}`, { method: "DELETE" });
                fetchRecords();
            } catch (error) {
                console.error("Failed to delete record", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-200">Scrap Management</h2>
                <button
                    onClick={() => {
                        setCurrentRecord({});
                        setIsModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Add Scrap Record
                </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Line</th>
                            <th className="px-6 py-3">Defect Type</th>
                            <th className="px-6 py-3 text-right">Quantity</th>
                            <th className="px-6 py-3">Reason</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : records.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            records.map((record) => (
                                <tr key={record.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{record.line}</td>
                                    <td className="px-6 py-4 font-medium text-slate-300">{record.defectType}</td>
                                    <td className="px-6 py-4 text-right text-red-400">{record.quantity}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{record.reason}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => {
                                                setCurrentRecord(record);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(record.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">
                            {currentRecord.id ? "Edit Record" : "New Scrap Record"}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Line</label>
                                <select
                                    value={currentRecord.line || "Line 1"}
                                    onChange={(e) => setCurrentRecord({ ...currentRecord, line: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                >
                                    <option value="Line 1">Line 1</option>
                                    <option value="Line 2">Line 2</option>
                                    <option value="Line 3">Line 3</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Defect Type</label>
                                <input
                                    type="text"
                                    value={currentRecord.defectType || ""}
                                    onChange={(e) => setCurrentRecord({ ...currentRecord, defectType: e.target.value })}
                                    placeholder="e.g., Dent, Scratch"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={currentRecord.quantity || 0}
                                    onChange={(e) => setCurrentRecord({ ...currentRecord, quantity: Number(e.target.value) })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Notes</label>
                                <textarea
                                    value={currentRecord.reason || ""}
                                    onChange={(e) => setCurrentRecord({ ...currentRecord, reason: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500 h-24"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                Save Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminScrap;
