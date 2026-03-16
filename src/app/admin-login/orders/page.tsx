"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Search, Filter, Download, ChevronDown, CheckCircle2, Clock, MapPin, Truck, Printer, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";

export default function OrdersPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:profiles!user_id(full_name, email, avatar_url),
                items:order_items(id, quantity, unit_price, total_price, selected_color, product:products!product_id(name, image_url))
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            setOrders(data || []);
        }
        setIsLoading(false);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setIsUpdating(true);
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) {
            alert("Failed to update status: " + error.message);
        } else {
            await logAdminAction(`Updated Order Status to ${newStatus}`, "Order", orderId);
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
            setOrders(updatedOrders);
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        }
        setIsUpdating(false);
    };

    const getAvatarText = (name?: string, email?: string) => {
        if (name) return name.charAt(0).toUpperCase();
        if (email) return email.charAt(0).toUpperCase();
        return 'O';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'PROCESSING': return 'bg-blue-100 text-blue-700';
            case 'SHIPPED': return 'bg-purple-100 text-purple-700';
            case 'DELIVERED': return 'bg-green-100 text-green-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        if (query &&
            !(order.order_number?.toLowerCase().includes(query) ||
                order.user?.full_name?.toLowerCase().includes(query) ||
                order.user?.email?.toLowerCase().includes(query) ||
                order.contact_phone?.toLowerCase().includes(query))) {
            return false;
        }

        if (startDate) {
            const orderDate = new Date(order.created_at);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (orderDate < start) return false;
        }

        if (endDate) {
            const orderDate = new Date(order.created_at);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (orderDate > end) return false;
        }

        if (activeTab === "all") return true;
        return order.status?.toLowerCase() === activeTab.toLowerCase();
    });

    const handleExportCSV = () => {
        if (filteredOrders.length === 0) {
            alert("No orders to export");
            return;
        }

        const headers = ["Order ID", "Customer Name", "Customer Email", "Phone", "Date", "Total Amount", "Items Count", "Payment Method", "Payment Status", "Order Status", "Shipping Address"];

        const csvRows = [];
        csvRows.push(headers.join(","));

        filteredOrders.forEach(order => {
            const row = [
                order.order_number || "",
                `"${(order.user?.full_name || 'Guest User').replace(/"/g, '""')}"`,
                order.user?.email || "",
                order.contact_phone || "",
                new Date(order.created_at).toLocaleString('en-US'),
                order.total_amount || "0",
                (order.items || []).length.toString(),
                order.payment_method || "",
                order.payment_status || "",
                order.status || "",
                `"${(order.shipping_address || "").replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track customer orders.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
                        <Download className="h-4 w-4" />
                        Export Orders
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar Tabs */}
                <div className="flex overflow-x-auto whitespace-nowrap items-center gap-6 px-4 border-b border-[#e5e5e5]">
                    {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`py-3 text-[13px] font-medium transition-colors border-b-2 ${activeTab === tab.toLowerCase() ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filtering & Search Toolbar */}
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search order ID, customer, phone..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-[#c9c9c9] rounded-md px-3 h-9 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-sm outline-none bg-transparent text-gray-700 w-auto"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-[#c9c9c9] rounded-md px-3 h-9 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-sm outline-none bg-transparent text-gray-700 w-auto"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium w-10">
                                    <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                </th>
                                <th className="px-5 py-3 font-medium">Order ID</th>
                                <th className="px-5 py-3 font-medium">Customer</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Total (Rs)</th>
                                <th className="px-5 py-3 font-medium">Payment</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-gray-500 text-sm">No orders found.</td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {order.order_number}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-inner overflow-hidden">
                                                {order.user?.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={order.user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                                ) : getAvatarText(order.user?.full_name, order.user?.email)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-gray-900">
                                                    {order.user?.full_name || (order.shipping_address ? order.shipping_address.split(',')[0] : 'Guest User')}
                                                </span>
                                                <span className="text-[11px] text-gray-500">{order.contact_phone || '-'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[12px] text-gray-600">{formatDate(order.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-gray-900">{order.total_amount}</span>
                                            <span className="text-[11px] text-gray-500">{(order.items || []).length} ITEMS</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[12px] font-medium text-gray-800">{order.payment_method || 'Unknown'}</span>
                                            <div className="flex items-center gap-1">
                                                {order.payment_status?.toUpperCase() === 'PAID' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-orange-500" />}
                                                <span className={`text-[11px] font-medium ${order.payment_status?.toUpperCase() === 'PAID' ? 'text-green-700' : 'text-orange-700'}`}>{order.payment_status || 'UNPAID'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${getStatusColor(order.status)}`}>
                                            {order.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-[13px] font-medium p-1 hover:bg-blue-50 rounded transition-colors" onClick={() => setSelectedOrder(order)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-[#e5e5e5] bg-gray-50/30 flex items-center justify-between text-[13px] text-gray-500">
                    Showing {filteredOrders.length} orders
                </div>
            </div>

            {/* Order Detail Slide-out */}
            <Drawer
                open={selectedOrder !== null}
                onClose={() => setSelectedOrder(null)}
                title={selectedOrder ? `Order Details: ${selectedOrder.order_number}` : "Order Details"}
                width="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">{selectedOrder.order_number}</h2>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(selectedOrder.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 bg-white" title="Print Invoice">
                                    <Printer className="h-4 w-4" />
                                </button>
                                <button className="p-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 bg-white" title="Download PDF">
                                    <FileText className="h-4 w-4" />
                                </button>
                                <div className={`px-3 py-1.5 rounded-md text-sm font-semibold ml-2 ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status || 'PENDING'}
                                </div>
                            </div>
                        </div>

                        {/* Grid Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
                                <h3 className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Shipping Address</h3>
                                <p className="text-[13px] font-semibold text-gray-900">
                                    {selectedOrder.user?.full_name || (selectedOrder.shipping_address ? selectedOrder.shipping_address.split(',')[0] : 'Guest User')}
                                </p>
                                <p className="text-[13px] text-gray-600 mt-1">{selectedOrder.shipping_address || 'No address provided'}</p>
                                <p className="text-[13px] text-gray-600 mt-2 font-medium">{selectedOrder.contact_phone}</p>
                                <p className="text-[13px] text-blue-600 mt-0.5">{selectedOrder.user?.email}</p>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
                                <h3 className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-3 flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Fulfillment Status</h3>
                                <div className="flex max-w-full relative mt-2 mb-6">
                                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 z-0"></div>
                                    <div className="w-1/3 flex justify-center z-10">
                                        <div className="h-4 w-4 rounded-full bg-teal-500 border border-white"></div>
                                    </div>
                                    <div className="w-1/3 flex justify-center z-10">
                                        <div className={`h-4 w-4 rounded-full border border-white ${selectedOrder.status?.toUpperCase() === 'PROCESSING' || selectedOrder.status?.toUpperCase() === 'SHIPPED' || selectedOrder.status?.toUpperCase() === 'DELIVERED' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                    </div>
                                    <div className="w-1/3 flex justify-center z-10">
                                        <div className={`h-4 w-4 rounded-full border border-white ${selectedOrder.status?.toUpperCase() === 'SHIPPED' || selectedOrder.status?.toUpperCase() === 'DELIVERED' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                    </div>
                                </div>
                                {selectedOrder.status?.toUpperCase() === "PENDING" && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                                        className="w-full py-1.5 flex justify-center items-center gap-2 bg-gray-900 text-white text-[13px] font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50">
                                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}  Mark as Processing
                                    </button>
                                )}
                                {selectedOrder.status?.toUpperCase() === "PROCESSING" && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                                        className="w-full py-1.5 flex justify-center items-center gap-2 bg-teal-600 text-white text-[13px] font-medium rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50">
                                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />} Mark as Shipped
                                    </button>
                                )}
                                {selectedOrder.status?.toUpperCase() === "SHIPPED" && (
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                                        className="w-full py-1.5 flex justify-center items-center gap-2 bg-green-600 text-white text-[13px] font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50">
                                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />} Mark as Delivered
                                    </button>
                                )}
                                {(selectedOrder.status?.toUpperCase() === "CANCELLED" || selectedOrder.status?.toUpperCase() === "DELIVERED") && (
                                    <p className="text-[13px] text-gray-500 text-center italic">No further actions required.</p>
                                )}
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50">
                                <h3 className="text-sm font-semibold text-gray-900">Order Items ({(selectedOrder.items || []).length})</h3>
                            </div>
                            <div className="p-0">
                                <ul className="divide-y divide-gray-100">
                                    {(selectedOrder.items || []).map((item: any, idx: number) => (
                                        <li key={idx} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-gray-100 rounded-md border border-gray-200 shadow-inner flex items-center justify-center shrink-0 overflow-hidden">
                                                    {item.product?.image_url ?
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.product.image_url} alt="Product" className="h-full w-full object-cover" />
                                                        : '📦'}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-medium text-gray-900">{item.product?.name || `Product ID: ${item.id}`}</p>
                                                    {item.selected_color && (
                                                        <p className="text-[12px] font-medium text-gray-700">Color: {item.selected_color}</p>
                                                    )}
                                                    <p className="text-[11px] text-gray-500">Unit Price: Rs {item.unit_price}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-medium text-gray-900">Rs {item.total_price}</p>
                                                <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </li>
                                    ))}
                                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                                        <li className="p-4 text-center text-[13px] text-gray-500">No items found for this order.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="p-4 border-t border-[#e5e5e5] bg-gray-50/30">
                                <div className="flex justify-between text-[13px] mb-1.5 text-gray-500">
                                    <span>Subtotal</span>
                                    <span>Rs {selectedOrder.total_amount}</span>
                                </div>
                                <div className="flex justify-between text-[13px] mb-1.5 text-gray-500">
                                    <span>Shipping</span>
                                    <span>Rs 0.00</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-900 mt-3 pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>Rs {selectedOrder.total_amount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 pb-8">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                            >
                                Close Drawer
                            </button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
