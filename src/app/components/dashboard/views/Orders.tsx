import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { exportToCSV } from "@/app/utils/csvExport";

interface Order {
    id: string;
    orderId: string;
    customer: string;
    region: string;
    product: string;
    orderQty: number;
    bookedOn: string;
    dueDate: string;
    status: string;
    dispatchStatus: string;
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState("All");
    const [region, setRegion] = useState("All");
    const [status, setStatus] = useState("All");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/orders");
                const data = await res.json();
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Filter Logic
    const filteredOrders = orders.filter((order) => {
        const matchesCustomer = customer === "All" || order.customer === customer;
        const matchesRegion = region === "All" || order.region === region;
        const matchesStatus = status === "All" || order.status === status;
        const matchesDate = dueDate ? order.dueDate === dueDate : true;
        return matchesCustomer && matchesRegion && matchesStatus && matchesDate;
    });

    // Metrics
    const openOrders = filteredOrders.filter(o => o.status === "Open").length;
    const completedOrders = filteredOrders.filter(o => o.status === "Completed").length;
    const totalOrders = filteredOrders.length;

    // Charts Data
    const statusData = [
        { name: "Open", value: openOrders },
        { name: "Completed", value: completedOrders },
    ];
    const STATUS_COLORS = ["#f97316", "#10b981"];

    const regionData = Array.from(new Set(orders.map(o => o.region))).map(r => ({
        name: r,
        orders: filteredOrders.filter(o => o.region === r).length
    }));

    const uniqueCustomers = Array.from(new Set(orders.map(o => o.customer)));
    const uniqueRegions = Array.from(new Set(orders.map(o => o.region)));

    if (loading) return <div className="p-8 text-slate-400">Loading Orders...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <section className="border-b border-slate-800 bg-slate-950">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-3 text-xs">
                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Customer</p>
                                <select
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueCustomers.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Region</p>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    {uniqueRegions.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Status</p>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                >
                                    <option>All</option>
                                    <option>Open</option>
                                    <option>Completed</option>
                                </select>
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] text-slate-400">Due date</p>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-orange-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-[11px]">
                            <button
                                onClick={() => {
                                    setCustomer("All");
                                    setRegion("All");
                                    setStatus("All");
                                    setDueDate("");
                                }}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Clear filters
                            </button>
                            <button
                                onClick={() => exportToCSV(orders, "orders_data")}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-orange-500 hover:text-orange-300"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="bg-slate-950 px-4 py-8">
                <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2">
                    {/* Status Distribution */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Order Status Distribution</span>
                            <span>Filtered View</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            {statusData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[index] }} />
                                    <span className="text-xs text-slate-400">{entry.name}: {entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Region-wise Orders */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Orders by Region</span>
                            <span>Filtered View</span>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={regionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.2 }}
                                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f1f5f9" }}
                                    />
                                    <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Orders Table */}
            <section className="bg-slate-950 px-4 pb-12">
                <div className="mx-auto max-w-6xl">
                    <h2 className="mb-3 text-sm font-semibold text-slate-50">
                        Order Details
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                        <table className="min-w-full text-[11px]">
                            <thead className="bg-slate-900/90 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium">Order ID</th>
                                    <th className="px-3 py-2 text-left font-medium">Customer</th>
                                    <th className="px-3 py-2 text-left font-medium">Region</th>
                                    <th className="px-3 py-2 text-left font-medium">Product</th>
                                    <th className="px-3 py-2 text-right font-medium">Qty</th>
                                    <th className="px-3 py-2 text-left font-medium">Booked On</th>
                                    <th className="px-3 py-2 text-left font-medium">Due Date</th>
                                    <th className="px-3 py-2 text-left font-medium">Status</th>
                                    <th className="px-3 py-2 text-left font-medium">Dispatch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-3 py-4 text-center text-slate-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-slate-900/40 border-b border-slate-800/50 last:border-0"
                                        >
                                            <td className="px-3 py-2 align-middle font-mono text-violet-400">{order.orderId}</td>
                                            <td className="px-3 py-2 align-middle">{order.customer}</td>
                                            <td className="px-3 py-2 align-middle">{order.region}</td>
                                            <td className="px-3 py-2 align-middle">{order.product}</td>
                                            <td className="px-3 py-2 align-middle text-right">{order.orderQty}</td>
                                            <td className="px-3 py-2 align-middle">{new Date(order.bookedOn).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 align-middle">{new Date(order.dueDate).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 align-middle">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 align-middle text-slate-400">{order.dispatchStatus}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Orders;
