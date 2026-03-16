"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Search, Filter, Download, MoreVertical, ShieldAlert, KeyRound, MapPin, Wallet, Mail, CircleDollarSign, LogIn, ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";

export default function UsersPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState("all");
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
    const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('joined_at', { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
        } else {
            setUsers(data || []);
        }
        setIsLoading(false);
    };

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        setIsUpdating(true);
        const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id);

        if (error) {
            alert("Failed to update status: " + error.message);
        } else {
            await logAdminAction(newStatus === 'BANNED' ? "Banned User" : "Unbanned User", "User", id);
            // Update local state and selected user
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
            if (selectedUser?.id === id) {
                setSelectedUser({ ...selectedUser, status: newStatus });
            }
        }
        setIsUpdating(false);
    };

    const getAvatarText = (name: string, email: string) => {
        if (name) return name.charAt(0).toUpperCase();
        if (email) return email.charAt(0).toUpperCase();
        return 'U';
    };

    const handleExportUsers = () => {
        if (filteredUsers.length === 0) {
            alert("No users to export.");
            return;
        }

        const headers = ["ID", "Name", "Email", "Role", "Status", "Total Orders", "Total Spent", "Joined At"];
        const csvContent = [
            headers.join(","),
            ...filteredUsers.map(u => [
                u.id,
                `"${u.full_name || ''}"`,
                `"${u.email || ''}"`,
                u.role,
                u.status,
                u.total_orders || 0,
                u.total_spent || 0,
                u.joined_at
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const filteredUsers = users.filter(user => {
        if (searchQuery &&
            !(user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
        }

        if (selectedRoleFilter !== "ALL" && user.role?.toUpperCase() !== selectedRoleFilter) {
            return false;
        }

        if (activeTab === "all") return true;
        if (activeTab === "customers" && user.role?.toUpperCase() === "CUSTOMER") return true;
        if (activeTab === "sellers" && user.role?.toUpperCase() === "SELLER") return true;
        if (activeTab === "banned" && user.status?.toUpperCase() === "BANNED") return true;
        return false;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Users</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage customers, sellers, and internal staff.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportUsers}
                        className="flex items-center gap-1.5 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
                        <Download className="h-4 w-4" />
                        Export Users
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar Tabs */}
                <div className="flex items-center gap-6 px-4 border-b border-[#e5e5e5]">
                    {["All", "Customers", "Sellers", "Banned"].map((tab) => (
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
                            placeholder="Search users by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                            className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm transition-colors">
                            <Filter className="h-4 w-4 text-gray-500" />
                            {selectedRoleFilter === "ALL" ? "Role" : selectedRoleFilter.charAt(0) + selectedRoleFilter.slice(1).toLowerCase()}
                            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                        </button>

                        {isRoleFilterOpen && (
                            <div className="absolute top-10 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 font-medium text-sm">
                                {["ALL", "CUSTOMER", "SELLER", "SUPER_ADMIN", "ADMIN"].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => {
                                            setSelectedRoleFilter(role);
                                            setIsRoleFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${selectedRoleFilter === role ? 'bg-gray-50 text-black' : 'text-gray-600'}`}
                                    >
                                        {role === "ALL" ? "All Roles" : role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium w-10">
                                    <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                </th>
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 font-medium">Orders</th>
                                <th className="px-5 py-3 font-medium">Total Spent</th>
                                <th className="px-5 py-3 font-medium">Joined</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-gray-500 text-sm">No users found.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0 shadow-inner overflow-hidden">
                                                {user.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={user.avatar_url} alt={user.full_name || 'User'} className="h-full w-full object-cover" />
                                                ) : getAvatarText(user.full_name, user.email)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{user.full_name || 'Unnamed User'}</span>
                                                <span className="text-[11px] text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${user.role?.toUpperCase() === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : user.role?.toUpperCase() === 'SELLER' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                            {user.role || 'CUSTOMER'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-[13px] font-medium text-gray-900 hover:text-blue-600 hover:underline">{user.total_orders || 0}</td>
                                    <td className="px-5 py-4 text-[13px] font-medium text-gray-900">Rs {user.total_spent || "0"}</td>
                                    <td className="px-5 py-4 text-[12px] text-gray-600">{formatDate(user.joined_at)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${user.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-900 p-1.5 rounded-md transition-colors focus:ring-2 focus:ring-black outline-none opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-[#e5e5e5] bg-gray-50/30 flex items-center justify-between text-[13px] text-gray-500">
                    Showing {filteredUsers.length} users
                </div>
            </div>

            <Drawer
                open={selectedUser !== null}
                onClose={() => setSelectedUser(null)}
                title={selectedUser ? `User Profile` : "User Profile"}
                width="md"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Header Profile Info */}
                        <div className="flex items-start gap-4 pb-4">
                            <div className="h-16 w-16 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xl font-bold border-4 border-white shadow-sm shrink-0 overflow-hidden">
                                {selectedUser.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={selectedUser.avatar_url} alt={selectedUser.full_name || 'User'} className="h-full w-full object-cover" />
                                ) : getAvatarText(selectedUser.full_name, selectedUser.email)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">{selectedUser.full_name || 'Unnamed User'}</h2>
                                <p className="text-[13px] text-gray-600">{selectedUser.email}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${selectedUser.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {selectedUser.status || 'ACTIVE'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                        {selectedUser.role || 'CUSTOMER'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <CircleDollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">Total Spent</p>
                                    <p className="text-sm font-bold text-gray-900">Rs {selectedUser.total_spent || "0"}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">Wallet Balance</p>
                                    <p className="text-sm font-bold text-gray-900">Rs 0.00</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-[13px] font-semibold text-gray-900">Contact & Activity</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 font-medium">{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <KeyRound className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 font-medium">Joined: {formatDate(selectedUser.joined_at)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
                            <h3 className="text-sm font-semibold text-orange-900 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> Admin Actions</h3>
                            <p className="text-xs text-orange-700 mt-1 mb-3">Take administrative actions for this user account.</p>
                            <div className="flex flex-col gap-2">
                                <button className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                                    <LogIn className="h-4 w-4 text-gray-500" />
                                    Impersonate User
                                </button>
                                {selectedUser.status?.toUpperCase() === 'ACTIVE' ? (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedUser.id, selectedUser.status)}
                                        disabled={isUpdating}
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ban Account"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedUser.id, selectedUser.status)}
                                        disabled={isUpdating}
                                        className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-green-200 text-green-600 text-sm font-medium rounded-md hover:bg-green-50 transition-colors shadow-sm disabled:opacity-50">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unban Account"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
