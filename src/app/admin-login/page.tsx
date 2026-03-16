import {
    ArrowUpRight, ArrowDownRight, CircleDollarSign, Users, ShoppingBag,
    TrendingUp, Clock, CreditCard, CheckCircle2, Package, XCircle, MoreVertical
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch All Orders for lifetime calculation
    // Note: If you have millions of orders, you would use aggregate queries, 
    // but for now, this ensures 100% accuracy.
    const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, payment_status, status, created_at, order_number, id, user_id')
        .order('created_at', { ascending: false });

    // Fetch Total Users
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalRevenue = 0;
    let dailySales = 0;
    let totalOrdersCount = allOrders?.length || 0;

    allOrders?.forEach(order => {
        const amount = Number(order.total_amount) || 0;
        const pStatus = order.payment_status?.toUpperCase();
        const oStatus = order.status?.toUpperCase();
        const createdAt = new Date(order.created_at);

        // Revenue logic: 
        // 1. Include ALL orders that are PAID
        // 2. Include DELIVERED orders (covers COD that is completed)
        // 3. Exclude CANCELLED orders even if marked Paid (to keep it accurate)
        if (oStatus !== 'CANCELLED') {
            if (pStatus === 'PAID' || oStatus === 'DELIVERED') {
                totalRevenue += amount;
                if (createdAt >= today) {
                    dailySales += amount;
                }
            }
        }
    });

    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // Fetch Recent Orders (with profile data) - limited to 5 for table
    const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
            *,
            user:profiles!user_id(full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch Recent Activity
    const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Revenue" value={`Rs ${totalRevenue.toLocaleString()}`} trend="+0%" isPositive={true} icon={CircleDollarSign} />
                <StatCard title="Daily Sales" value={`Rs ${dailySales.toLocaleString()}`} trend="+100%" isPositive={true} icon={TrendingUp} />
                <StatCard title="Total Users" value={totalUsers?.toLocaleString() || "0"} trend="+0%" isPositive={true} icon={Users} />
                <StatCard title="Total Orders" value={totalOrdersCount?.toLocaleString() || "0"} trend="+0%" isPositive={true} icon={ShoppingBag} />
                <StatCard title="Avg Order Value" value={`Rs ${Math.round(avgOrderValue).toLocaleString()}`} trend="+0%" isPositive={true} icon={CircleDollarSign} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 tracking-tight">Recent Orders</h2>
                        <Link href="/admin-login/orders" className="text-sm text-blue-600 hover:underline font-medium">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                    <th className="px-5 py-3 font-medium">Order ID</th>
                                    <th className="px-5 py-3 font-medium">Customer</th>
                                    <th className="px-5 py-3 font-medium">Total (Rs)</th>
                                    <th className="px-5 py-3 font-medium">Payment</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {recentOrders?.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-5 py-3 font-medium text-blue-600 hover:underline cursor-pointer">
                                            <Link href={`/admin-login/orders`}>{order.order_number}</Link>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                                    {order.user?.full_name?.charAt(0) || order.shipping_address?.charAt(0) || 'G'}
                                                </div>
                                                <span className="text-gray-900 font-medium">{order.user?.full_name || (order.shipping_address ? order.shipping_address.split(',')[0] : 'Guest User')}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-900 font-medium">{Number(order.total_amount).toLocaleString()}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {order.payment_status?.toUpperCase() === 'PAID' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Clock className="h-3.5 w-3.5 text-orange-500" />}
                                                <span className="text-gray-700">{order.payment_status || 'UNPAID'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-medium">
                                            <span className={`px-2 py-1 rounded-md text-[11px] uppercase ${
                                                order.status?.toUpperCase() === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                                order.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status || 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!recentOrders || recentOrders.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="p-5 text-center text-gray-500">No orders yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Activity Timeline */}
                <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900 tracking-tight">User Activity</h2>
                        <Link href="/admin-login/activity" className="text-sm text-blue-600 hover:underline font-medium">View All</Link>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                        <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">
                            {activityLogs?.map((event, i) => (
                                <div key={i} className="relative pl-6">
                                    <div className="absolute -left-3.5 top-0.5 h-7 w-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm bg-blue-500 text-white">
                                        <Package className="h-3 w-3" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-gray-900">
                                            <span className="font-semibold text-gray-900">{event.actor_name}</span> {event.action} <span className="font-medium text-gray-700">{event.entity_type} {event.entity_id}</span>
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">{format(new Date(event.created_at), 'PPp')}</p>
                                    </div>
                                </div>
                            ))}
                            {(!activityLogs || activityLogs.length === 0) && (
                                <p className="text-sm text-gray-500 text-center">No recent activity.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, isPositive, icon: Icon }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                    <Icon className="h-4 w-4 text-gray-600" />
                </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className={`flex items-center font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {trend}
                </span>
                <span className="text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">vs last month</span>
            </div>
        </div>
    );
}
