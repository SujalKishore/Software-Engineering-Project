import React, { useState, useEffect } from "react";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<ProductionRecord>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/production");
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
            const res = await fetch("/api/production", {
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
                await fetch(`/api/production?id=${id}`, { method: "DELETE" });
                fetchRecords();
            } catch (error) {
                console.error("Failed to delete record", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-200">Daily Production</h2>
                <button
                    onClick={() => {
                        setCurrentRecord({});
                        setIsModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Add Record
                </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Line</th>
                            <th className="px-6 py-3">Shift</th>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3 text-right">Target</th>
                            <th className="px-6 py-3 text-right">Actual</th>
                            <th className="px-6 py-3 text-right">Eff %</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : records.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            records.map((record) => (
                                <tr key={record.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{record.line}</td>
                                    <td className="px-6 py-4">{record.shift}</td>
                                    <td className="px-6 py-4 font-medium text-slate-300">{record.product}</td>
                                    <td className="px-6 py-4 text-right">{record.target}</td>
                                    <td className="px-6 py-4 text-right">{record.actual}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${record.efficiency >= 90 ? 'bg-green-500/10 text-green-400' :
                                                record.efficiency >= 80 ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-red-500/10 text-red-400'
                                            }`}>
                                            {record.efficiency}%
                                        </span>
                                    </td>
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
                            {currentRecord.id ? "Edit Record" : "New Production Record"}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Shift</label>
                                    <select
                                        value={currentRecord.shift || "A"}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, shift: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Product</label>
                                    <input
                                        type="text"
                                        value={currentRecord.product || ""}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, product: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Target</label>
                                    <input
                                        type="number"
                                        value={currentRecord.target || 0}
                                        onChange={(e) => setCurrentRecord({ ...currentRecord, target: Number(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Actual</label>
                                    <input
                                        type="number"
                                        value={currentRecord.actual || 0}
                                        onChange={(e) => {
                                            const actual = Number(e.target.value);
                                            const target = currentRecord.target || 1;
                                            const efficiency = Math.round((actual / target) * 100);
                                            setCurrentRecord({ ...currentRecord, actual, efficiency });
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Efficiency (%)</label>
                                <input
                                    type="number"
                                    readOnly
                                    value={currentRecord.efficiency || 0}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed"
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

export default AdminProduction;
