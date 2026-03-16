"use client";

import { useEffect, useState } from "react";
import { getInquiries, updateInquiryStatus, deleteInquiryAction } from "@/app/actions/contact";
import { 
    Mail, 
    MessageSquare, 
    Trash2, 
    Eye, 
    CheckCircle, 
    Clock, 
    Search,
    User,
    Phone,
    MapPin,
    Calendar,
    X,
    Filter
} from "lucide-react";
import { format } from "date-fns";

type Inquiry = {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
};

export default function ContactAdminPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    const fetchInquiries = async () => {
        setLoading(true);
        const result = await getInquiries();

        if (result.success && result.data) {
            setInquiries(result.data);
        } else if (result.error) {
            console.error(result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const result = await updateInquiryStatus(id, status);

        if (result.success) {
            setInquiries(inquiries.map(iq => iq.id === id ? { ...iq, status } : iq));
            if (selectedInquiry?.id === id) {
                setSelectedInquiry({ ...selectedInquiry, status });
            }
        }
    };

    const deleteInquiry = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        const result = await deleteInquiryAction(id);

        if (result.success) {
            setInquiries(inquiries.filter(iq => iq.id !== id));
            setSelectedInquiry(null);
        }
    };

    const filteredInquiries = inquiries.filter(iq => 
        iq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        iq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        iq.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        Contact Messages
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and respond to customer inquiries from your website.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{inquiries.length}</p>
                        <p className="text-xs text-gray-500">Total inquiries</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 dark:bg-neutral-800 mx-2" />
                    <button 
                        onClick={fetchInquiries}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-gray-500"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search by name, email or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-900 dark:text-white"
                />
            </div>

            {/* Inquiries Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sender</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 dark:bg-neutral-800 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <Mail className="w-12 h-12 text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium">No inquiries found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInquiries.map((iq) => (
                                    <tr 
                                        key={iq.id} 
                                        className={`hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer ${iq.status === 'NEW' ? 'font-semibold' : ''}`}
                                        onClick={() => {
                                            setSelectedInquiry(iq);
                                            if (iq.status === 'NEW') updateStatus(iq.id, 'READ');
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 dark:text-white">{iq.name}</span>
                                                <span className="text-xs text-gray-500">{iq.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{iq.subject}</span>
                                                <span className="text-xs text-gray-400 truncate max-w-[250px]">{iq.message.substring(0, 50)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(iq.created_at), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                iq.status === 'NEW' 
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                                    : 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-400'
                                            }`}>
                                                {iq.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteInquiry(iq.id);
                                                    }}
                                                    className="p-1.5 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inquiry Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        {/* Modal Header */}
                        <div className="relative h-32 bg-[#1d4ed8] p-8 flex items-end">
                            <button 
                                onClick={() => setSelectedInquiry(null)}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-2xl font-bold text-white leading-none">{selectedInquiry.subject}</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-100 dark:border-neutral-800 pb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <User className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium">{selectedInquiry.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium">{selectedInquiry.email}</span>
                                    </div>
                                    {selectedInquiry.phone && (
                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                            <Phone className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">{selectedInquiry.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium">{selectedInquiry.city || "Unknown City"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium">{format(new Date(selectedInquiry.created_at), "PPP p")}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium">Status: {selectedInquiry.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-neutral-800/30 p-6 rounded-2xl relative">
                                <MessageSquare className="absolute -top-3 -left-3 w-8 h-8 text-blue-500/10" />
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Message Content</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                                    "{selectedInquiry.message}"
                                </p>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button 
                                    onClick={() => setSelectedInquiry(null)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => deleteInquiry(selectedInquiry.id)}
                                    className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Inquiry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
