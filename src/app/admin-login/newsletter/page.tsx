"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Search, Filter, Download, MailPlus, Users, XCircle, CheckCircle2, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function NewsletterPage() {
    const supabase = createClient();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [subs, setSubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [isUpdating, setIsUpdating] = useState(false);

    // Broadcast states
    const [broadcastSubject, setBroadcastSubject] = useState("");
    const [broadcastContent, setBroadcastContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [broadcastAudience, setBroadcastAudience] = useState("all");

    // KPIs
    const [totalSubs, setTotalSubs] = useState(0);
    const [joinedToday, setJoinedToday] = useState(0);
    const [joinedThisMonth, setJoinedThisMonth] = useState(0);

    useEffect(() => {
        fetchSubscribers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSubscribers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching subscribers:", error);
        } else {
            const subscribers = data || [];
            setSubs(subscribers);

            // Calculate KPIs
            const activeCount = subscribers.filter(s => s.status?.toUpperCase() === 'ACTIVE').length;
            setTotalSubs(activeCount);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const joinedTodayCount = subscribers.filter(s => new Date(s.created_at) >= today).length;
            const joinedMonthCount = subscribers.filter(s => new Date(s.created_at) >= firstOfMonth).length;

            setJoinedToday(joinedTodayCount);
            setJoinedThisMonth(joinedMonthCount);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Are you sure you want to delete the subscriber ${email}?`)) return;

        setIsUpdating(true);
        const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);

        if (error) {
            alert("Failed to delete subscriber: " + error.message);
        } else {
            fetchSubscribers(); // Refresh to update counts
        }
        setIsUpdating(false);
    };

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        setIsUpdating(true);
        const newStatus = currentStatus?.toUpperCase() === 'ACTIVE' ? 'UNSUBSCRIBED' : 'ACTIVE';
        const { error } = await supabase.from('newsletter_subscribers').update({ status: newStatus }).eq('id', id);

        if (error) {
            alert("Failed to update status: " + error.message);
        } else {
            fetchSubscribers(); // Refresh to update counts
        }
        setIsUpdating(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const filteredSubs = subs.filter(sub => {
        const query = searchQuery.toLowerCase();
        if (query && !sub.email?.toLowerCase().includes(query)) {
            return false;
        }
        if (activeFilter === "all") return true;
        return sub.status?.toLowerCase() === activeFilter.toLowerCase();
    });

    const handleExport = () => {
        if (!filteredSubs || filteredSubs.length === 0) {
            alert("No subscribers to export");
            return;
        }

        const headers = ["Email", "Subscribed On", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredSubs.map(sub => [
                sub.email,
                new Date(sub.created_at).toISOString(),
                sub.status || 'ACTIVE'
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Newsletter</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage subscribers and send email broadcasts.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
                        <Download className="h-4 w-4" />
                        Export List
                    </button>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
                    >
                        <MailPlus className="h-4 w-4" />
                        Compose Broadcast
                    </button>
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Active Subscribers</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{totalSubs}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users className="h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Joined Today</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{joinedToday}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <Users className="h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Joined This Month</h3>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{joinedThisMonth}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Users className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                {/* Filtering & Search Toolbar */}
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search email addresses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            className="h-9 px-3 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm transition-colors outline-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="unsubscribed">Unsubscribed</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium w-10">
                                    <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                </th>
                                <th className="px-5 py-3 font-medium">Email Address</th>
                                <th className="px-5 py-3 font-medium">Subscribed On</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading subscribers...</p>
                                    </td>
                                </tr>
                            ) : filteredSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500 text-sm">No subscribers found.</td>
                                </tr>
                            ) : filteredSubs.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                    </td>
                                    <td className="px-5 py-4 font-medium text-gray-900">{s.email}</td>
                                    <td className="px-5 py-4 text-[12px] text-gray-600">{formatDate(s.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 w-max ${s.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {s.status?.toUpperCase() === 'ACTIVE' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {s.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleUpdateStatus(s.id, s.status)}
                                                disabled={isUpdating}
                                                className="text-[12px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors disabled:opacity-50">
                                                Toggle Status
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id, s.email)}
                                                disabled={isUpdating}
                                                className="text-[12px] font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50 flex items-center gap-1">
                                                <Trash2 className="h-3 w-3" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Drawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Compose Broadcast"
                width="lg"
            >
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">To (Recipients)</label>
                            <select
                                value={broadcastAudience}
                                onChange={(e) => setBroadcastAudience(e.target.value)}
                                className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white text-gray-700 font-medium"
                            >
                                <option value="all">All Active Subscribers ({totalSubs})</option>
                                <option value="new">New Subscribers - Last 30 Days ({joinedThisMonth})</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Subject Line <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={broadcastSubject}
                                onChange={(e) => setBroadcastSubject(e.target.value)}
                                className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                                placeholder="e.g. Huge Winter Sale Starts Now!"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
                        <label className="block text-[13px] font-medium text-gray-700 mb-0">Email Content (HTML / WYSIWYG Mock)</label>
                        <div className="border border-gray-200 rounded-md overflow-hidden flex flex-col h-[300px]">
                            <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
                                {/* Fake WYSIWYG toolbar */}
                                <div className="h-6 w-6 bg-white border border-gray-200 rounded shrink-0 flex items-center justify-center font-bold text-xs">B</div>
                                <div className="h-6 w-6 bg-white border border-gray-200 rounded shrink-0 flex items-center justify-center italic text-xs">I</div>
                                <div className="h-6 w-6 bg-white border border-gray-200 rounded shrink-0 flex items-center justify-center underline text-xs">U</div>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <div className="h-6 w-6 bg-white border border-gray-200 rounded shrink-0 flex items-center justify-center text-xs">🔗</div>
                                <div className="h-6 w-6 bg-white border border-gray-200 rounded shrink-0 flex items-center justify-center text-xs">🖼️</div>
                            </div>
                            <textarea
                                value={broadcastContent}
                                onChange={(e) => setBroadcastContent(e.target.value)}
                                className="flex-1 w-full p-4 text-sm resize-none outline-none focus:ring-1 focus:ring-inset focus:ring-black"
                                placeholder="Write your email content here..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 pb-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 h-4 w-4" />
                            <span className="text-[13px] text-gray-700 font-medium">Schedule for later</span>
                        </label>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={async () => {
                                    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
                                        alert("Please enter a subject and content for the broadcast.");
                                        return;
                                    }
                                    setIsSending(true);
                                    // Mock sending delay
                                    await new Promise(res => setTimeout(res, 1500));
                                    alert(`Broadcast "${broadcastSubject}" sent successfully!`);

                                    // Reset and close
                                    setIsSending(false);
                                    setIsDrawerOpen(false);
                                    setBroadcastSubject("");
                                    setBroadcastContent("");
                                }}
                                disabled={isSending}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? "Sending..." : <>Send Now <MailPlus className="h-4 w-4" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
