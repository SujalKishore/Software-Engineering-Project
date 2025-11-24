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
import { Search, Calendar, Filter, Download, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

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
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [searchQuery, setSearchQuery] = useState("");
    const [customer, setCustomer] = useState("All");
    const [region, setRegion] = useState("All");
    const [status, setStatus] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Fetching all for client-side filtering/pagination for now
            const res = await fetch(`/api/orders?limit=500&offset=0`);
            const data = await res.json();
            setOrders(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter Logic
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCustomer = customer === "All" || order.customer === customer;
        const matchesRegion = region === "All" || order.region === region;
        const matchesStatus = status === "All" || order.status === status;
        const matchesStartDate = startDate ? new Date(order.bookedOn) >= new Date(startDate) : true;
        const matchesEndDate = endDate ? new Date(order.bookedOn) <= new Date(endDate) : true;

        return matchesSearch && matchesCustomer && matchesRegion && matchesStatus && matchesStartDate && matchesEndDate;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Metrics
    const openOrders = filteredOrders.filter(o => o.status === "Open").length;
    const completedOrders = filteredOrders.filter(o => o.status === "Completed").length;
    const totalOrders = filteredOrders.length;

    // Charts Data
    // Charts Data
    const allStatuses = ["Open", "In Progress", "Completed", "On Hold", "Cancelled", "Returned"];
    const statusColors: Record<string, string> = {
        "Open": "#3b82f6", // Blue
        "In Progress": "#f59e0b", // Amber
        "Completed": "#10b981", // Emerald
        "On Hold": "#6366f1", // Indigo
        "Cancelled": "#ef4444", // Red
        "Returned": "#ec4899", // Pink
    };

    const statusData = allStatuses.map(status => ({
        name: status,
        value: filteredOrders.filter(o => o.status === status).length,
        color: statusColors[status]
    })).filter(item => item.value > 0);

    const regionData = Array.from(new Set(orders.map(o => o.region))).map(r => ({
        name: r,
        orders: filteredOrders.filter(o => o.region === r).length
    }));

    const uniqueCustomers = Array.from(new Set(orders.map(o => o.customer)));
    const uniqueRegions = Array.from(new Set(orders.map(o => o.region)));

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filters */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Order ID or Product..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 rounded-xl border border-white/10 bg-slate-950/50 pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all outline-none"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-1.5">
                                <Calendar size={14} className="text-slate-500" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-xs text-white outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                                <span className="text-slate-500">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-xs text-white outline-none [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="flex gap-2">
                                {[
                                    { label: "Customer", value: customer, setter: setCustomer, options: uniqueCustomers },
                                    { label: "Region", value: region, setter: setRegion, options: uniqueRegions },
                                    { label: "Status", value: status, setter: setStatus, options: ["Open", "In Progress", "Completed", "On Hold", "Cancelled", "Returned"] },
                                ].map((filter) => (
                                    <div key={filter.label} className="relative">
                                        <select
                                            value={filter.value}
                                            onChange={(e) => filter.setter(e.target.value)}
                                            className="appearance-none rounded-xl border border-white/10 bg-slate-950/50 pl-3 pr-8 py-2.5 text-xs text-white outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:bg-slate-900"
                                        >
                                            <option>All</option>
                                            {filter.options.map(opt => <option key={opt}>{opt}</option>)}
                                        </select>
                                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setCustomer("All");
                                    setRegion("All");
                                    setStatus("All");
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => exportToCSV(orders, "orders_data")}
                                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
                            >
                                <Download size={14} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Charts */}
            <section className="grid gap-6 md:grid-cols-2">
                {/* Status Distribution */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Order Status</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Distribution</span>
                    </div>
                    <div className="h-48 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">{totalOrders}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {statusData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs font-medium text-slate-300">{entry.name}: <span className="text-white">{entry.value}</span></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Region-wise Orders */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Orders by Region</h3>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Volume</span>
                    </div>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "8px" }}
                                />
                                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Orders Table */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white">Order Details</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Rows:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 outline-none focus:border-orange-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                        <thead className="bg-white/5 text-slate-200 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Region</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4 text-right">Qty</th>
                                <th className="px-6 py-4">Booked On</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Dispatch</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                                        No orders found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-violet-400">{order.orderId}</td>
                                        <td className="px-6 py-4 font-medium text-white">{order.customer}</td>
                                        <td className="px-6 py-4">{order.region}</td>
                                        <td className="px-6 py-4 text-slate-300">{order.product}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-200">{order.orderQty}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(order.bookedOn).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(order.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${order.status === 'Completed'
                                                ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                                                : 'bg-orange-500/10 text-orange-400 ring-orange-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{order.dispatchStatus}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
                    <div className="text-xs text-slate-500">
                        Showing <span className="font-medium text-white">{currentItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of <span className="font-medium text-white">{filteredOrders.length}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default Orders;
