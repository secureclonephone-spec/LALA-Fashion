"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Trash2, ChevronDown, User, Server, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ActivityLogPage() {
    const supabase = createClient();
    const [activeFilter, setActiveFilter] = useState("all");
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error("Error fetching activity logs:", error);
        } else {
            setLogs(data || []);
        }
        setIsLoading(false);
    };

    const handleClearOldLogs = async () => {
        if (!confirm("Are you sure you want to delete logs older than 90 days?")) return;

        setIsClearing(true);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const { error } = await supabase
            .from('activity_logs')
            .delete()
            .lt('created_at', ninetyDaysAgo.toISOString());

        if (error) {
            alert("Failed to clear logs: " + error.message);
        } else {
            alert("Successfully cleared old logs.");
            fetchLogs();
        }
        setIsClearing(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const handleExportLogs = () => {
        if (filteredLogs.length === 0) {
            alert("No logs to export.");
            return;
        }

        const headers = ["Time", "Actor", "Action", "Type", "IP Address", "Details"];
        const rows = filteredLogs.map(log => [
            `"${formatDate(log.created_at)}"`,
            `"${log.actor_name || 'System'}"`,
            `"${log.action || ''}"`,
            `"${log.entity_type || ''}"`,
            `"${log.ip_address || ''}"`,
            `"${(log.details || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const types = ["All", "Order", "Store", "User", "Product", "Category", "Coupon", "Settings"];

    const filteredLogs = logs.filter(log => {
        const query = searchQuery.toLowerCase();
        if (query &&
            !(log.action?.toLowerCase().includes(query) ||
                log.ip_address?.toLowerCase().includes(query) ||
                log.user?.full_name?.toLowerCase().includes(query) ||
                log.user?.email?.toLowerCase().includes(query))) {
            return false;
        }
        if (activeFilter === "all") return true;
        return log.entity_type?.toLowerCase() === activeFilter.toLowerCase();
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Activity Log</h1>
                    <p className="text-sm text-gray-500 mt-1">Audit trail of all administrative and system actions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportLogs}
                        className="flex items-center gap-1.5 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
                        <Download className="h-4 w-4" />
                        Export Logs
                    </button>
                    <button
                        onClick={handleClearOldLogs}
                        disabled={isClearing}
                        className="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors disabled:opacity-50">
                        {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Clear Old Logs
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                {/* Filtering & Search Toolbar */}
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs by IP, action, actor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {types.map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveFilter(t.toLowerCase())}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${activeFilter === t.toLowerCase() ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium">Time</th>
                                <th className="px-5 py-3 font-medium">Actor</th>
                                <th className="px-5 py-3 font-medium">Action</th>
                                <th className="px-5 py-3 font-medium">IP Address</th>
                                <th className="px-5 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading logs...</p>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500 text-sm">No activity logs found.</td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-5 py-4 whitespace-nowrap text-[12px] text-gray-500 font-medium">{formatDate(log.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {!log.actor_id ? <Server className="h-3.5 w-3.5 text-blue-500" /> : <User className="h-3.5 w-3.5 text-gray-500" />}
                                            <span className={`text-[12px] font-medium ${!log.actor_id ? 'text-blue-700' : 'text-gray-900'}`}>
                                                {log.actor_name || 'System'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-[13px] text-gray-800">{log.action}</span>
                                        {log.entity_type && (
                                            <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-500 font-medium inline-block">{log.entity_type}</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-[12px] text-gray-600 font-mono">{log.ip_address || '-'}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1 max-w-xs">
                                            <span className="text-[12px] text-gray-500 truncate group-hover:whitespace-normal group-hover:break-words transition-all duration-300 ease-in-out cursor-help" title={log.details || ''}>
                                                {log.details || '-'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Retention Controls inside footer */}
                <div className="p-4 border-t border-[#e5e5e5] bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-gray-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>Logs are automatically retained for <strong>90 days</strong>. Showing {filteredLogs.length} recent logs.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
