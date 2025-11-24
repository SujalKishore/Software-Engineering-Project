import React, { useEffect, useState } from "react";

interface PendingRequest {
    id: string;
    type: string;
    entity: string;
    data: string;
    requestedBy: string;
    createdAt: string;
}

const AdminRequests: React.FC = () => {
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/admin/requests");
            const data = await res.json();
            setRequests(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, action: "APPROVE" | "REJECT") => {
        try {
            const res = await fetch("/api/admin/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });
            if (res.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error("Failed to process request", error);
        }
    };

    if (loading) return <div className="p-6 text-slate-400">Loading requests...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <span className="text-2xl">🔔</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-100">Approval Requests</h2>
                    <p className="text-xs text-slate-400">Review and approve changes from users</p>
                </div>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                        No pending requests.
                    </div>
                ) : (
                    requests.map((req) => {
                        const data = JSON.parse(req.data);
                        return (
                            <div key={req.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${req.type === "CREATE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                req.type === "UPDATE" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                    "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                            {req.type}
                                        </span>
                                        <span className="text-slate-400 text-sm font-medium">{req.entity}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-1">
                                        Requested by <span className="text-slate-100 font-medium">{req.requestedBy}</span>
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {new Date(req.createdAt).toLocaleString()}
                                    </p>
                                    <div className="mt-3 p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-400 border border-slate-800/50 max-w-xl overflow-x-auto">
                                        {JSON.stringify(data, null, 2)}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(req.id, "REJECT")}
                                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, "APPROVE")}
                                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminRequests;
