"use client";

import { useState, useEffect, useMemo } from "react";
import { Drawer } from "@/components/admin/Drawer";
import {
    Search, Plus, Trash2, Edit, ChevronDown, CheckCircle2, XCircle,
    Loader2, Ticket, X, Check
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Coupon {
    id: string;
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    applies_to: string;
    applied_product_ids: string[];
    applied_category_ids: string[];
    min_order_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    limit_per_customer: boolean;
    only_new_users: boolean;
    expires_at: string | null;
    status: string;
    created_at: string;
}

interface Product { id: string; name: string; image_url?: string; }
interface Category { id: string; name: string; }

const DEFAULT_FORM = {
    id: "",
    code: "",
    description: "",
    discount_type: "Percentage (%)",
    discount_value: "",
    applies_to: "Entire Order",
    applied_product_ids: [] as string[],
    applied_category_ids: [] as string[],
    min_order_amount: "",
    usage_limit: "",
    limit_per_customer: false,
    only_new_users: false,
    expires_at: "",
    status: "ACTIVE",
};

// ─── Multi-select picker component ────────────────────────────────────────────
function MultiSelectPicker({
    items, selectedIds, onToggle, searchable = true, label,
}: {
    items: { id: string; name: string }[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    searchable?: boolean;
    label: string;
}) {
    const [search, setSearch] = useState("");
    const filtered = useMemo(() =>
        search ? items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) : items,
        [items, search]
    );

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            {searchable && (
                <div className="p-2 border-b border-gray-100 relative">
                    <Search className="absolute left-4 top-3.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={`Search ${label}...`}
                        className="w-full pl-7 pr-3 py-1.5 text-[13px] rounded-md border border-gray-200 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                    />
                </div>
            )}
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                {filtered.length === 0 ? (
                    <p className="p-3 text-[12px] text-gray-400 text-center">No {label} found.</p>
                ) : filtered.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggle(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-[13px] transition-colors ${isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            <span className="font-medium truncate pr-2">{item.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
                        </button>
                    );
                })}
            </div>
            {selectedIds.length > 0 && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
                    {selectedIds.length} selected
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CouponsPage() {
    const supabase = createClient();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerTitle, setDrawerTitle] = useState("Create New Coupon");
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [formData, setFormData] = useState({ ...DEFAULT_FORM });

    // Load all data on mount
    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAll = async () => {
        setIsLoading(true);
        const [couponsRes, productsRes, categoriesRes] = await Promise.all([
            supabase.from("coupons").select("*").order("created_at", { ascending: false }),
            supabase.from("products").select("id, name, image_url").order("name"),
            supabase.from("categories").select("id, name").order("name"),
        ]);
        setCoupons(couponsRes.data || []);
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        setIsLoading(false);
    };

    const openCreate = () => {
        setFormData({ ...DEFAULT_FORM });
        setDrawerTitle("Create New Coupon");
        setIsDrawerOpen(true);
    };

    const openEdit = (c: Coupon) => {
        setFormData({
            id: c.id,
            code: c.code,
            description: c.description || "",
            discount_type: c.discount_type,
            discount_value: String(c.discount_value),
            applies_to: c.applies_to || "Entire Order",
            applied_product_ids: c.applied_product_ids || [],
            applied_category_ids: c.applied_category_ids || [],
            min_order_amount: c.min_order_amount != null ? String(c.min_order_amount) : "",
            usage_limit: c.usage_limit != null ? String(c.usage_limit) : "",
            limit_per_customer: c.limit_per_customer ?? false,
            only_new_users: c.only_new_users ?? false,
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
            status: c.status || "ACTIVE",
        });
        setDrawerTitle("Edit Coupon");
        setIsDrawerOpen(true);
    };

    const toggleProduct = (id: string) => {
        setFormData(prev => ({
            ...prev,
            applied_product_ids: prev.applied_product_ids.includes(id)
                ? prev.applied_product_ids.filter(x => x !== id)
                : [...prev.applied_product_ids, id],
        }));
    };

    const toggleCategory = (id: string) => {
        setFormData(prev => ({
            ...prev,
            applied_category_ids: prev.applied_category_ids.includes(id)
                ? prev.applied_category_ids.filter(x => x !== id)
                : [...prev.applied_category_ids, id],
        }));
    };

    const handleAutoGenerate = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData(prev => ({ ...prev, code: result }));
    };

    const handleSave = async () => {
        if (!formData.code.trim() || formData.discount_value === "") {
            alert("Coupon Code and Discount Value are required.");
            return;
        }
        if (formData.applies_to === "Specific Products" && formData.applied_product_ids.length === 0) {
            alert("Please select at least one product for this coupon.");
            return;
        }
        if (formData.applies_to === "Specific Categories" && formData.applied_category_ids.length === 0) {
            alert("Please select at least one category for this coupon.");
            return;
        }
        setIsSubmitting(true);

        const payload: any = {
            code: formData.code.trim().toUpperCase(),
            description: formData.description,
            discount_type: formData.discount_type,
            discount_value: parseFloat(formData.discount_value) || 0,
            applies_to: formData.applies_to,
            applied_product_ids: formData.applies_to === "Specific Products" ? formData.applied_product_ids : [],
            applied_category_ids: formData.applies_to === "Specific Categories" ? formData.applied_category_ids : [],
            min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            limit_per_customer: formData.limit_per_customer,
            only_new_users: formData.only_new_users,
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
            status: formData.status,
        };

        let error;
        if (formData.id) {
            // Update existing
            ({ error } = await supabase.from("coupons").update(payload).eq("id", formData.id));
            if (!error) await logAdminAction("Updated Coupon", "Coupon", formData.id, { code: payload.code });
        } else {
            // Insert new
            ({ error } = await supabase.from("coupons").insert(payload));
            if (!error) await logAdminAction("Created Coupon", "Coupon", undefined, { code: payload.code, discount: `${payload.discount_value} ${payload.discount_type}` });
        }

        if (error) {
            alert("Failed to save coupon: " + error.message);
        } else {
            setIsDrawerOpen(false);
            fetchAll();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        const { error } = await supabase.from("coupons").delete().eq("id", id);
        if (error) { alert("Failed to delete: " + error.message); return; }
        await logAdminAction("Deleted Coupon", "Coupon", id);
        fetchAll();
    };

    const filteredCoupons = useMemo(() => coupons.filter(c => {
        const matchSearch = c.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchStatus = statusFilter === "All" || c.status === statusFilter;
        return matchSearch && matchStatus;
    }), [coupons, searchQuery, statusFilter]);

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "–";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Coupons</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage promotional discount codes and limits.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus className="h-4 w-4" /> Create Coupon
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search coupons..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none h-9 pl-3 pr-8 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                        >
                            <option value="All">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium">Coupon Code</th>
                                <th className="px-5 py-3 font-medium">Discount</th>
                                <th className="px-5 py-3 font-medium">Applies To</th>
                                <th className="px-5 py-3 font-medium">Usage</th>
                                <th className="px-5 py-3 font-medium">Restrictions</th>
                                <th className="px-5 py-3 font-medium">Created</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading coupons...</p>
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-gray-400">
                                        No coupons found.
                                    </td>
                                </tr>
                            ) : filteredCoupons.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                <Ticket className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[13px] text-gray-900 font-mono">{item.code}</span>
                                                {item.description && <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                        {item.discount_value}{item.discount_type?.includes("%") ? "%" : " Rs"} off
                                    </td>
                                    <td className="px-5 py-4 text-[12px] text-gray-600">
                                        <span>{item.applies_to || "Entire Order"}</span>
                                        {item.applies_to === "Specific Products" && item.applied_product_ids?.length > 0 && (
                                            <span className="ml-1 text-blue-600 font-medium">({item.applied_product_ids.length} products)</span>
                                        )}
                                        {item.applies_to === "Specific Categories" && item.applied_category_ids?.length > 0 && (
                                            <span className="ml-1 text-blue-600 font-medium">({item.applied_category_ids.length} categories)</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1 w-24">
                                            <div className="flex justify-between text-[11px] font-medium text-gray-600">
                                                <span>{item.used_count || 0}</span>
                                                <span>{item.usage_limit ?? "∞"}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${item.usage_limit && (item.used_count || 0) >= item.usage_limit ? "bg-red-500" : "bg-teal-500"}`}
                                                    style={{ width: item.usage_limit ? `${Math.min((item.used_count || 0) / item.usage_limit, 1) * 100}%` : "0%" }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.limit_per_customer && (
                                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded">1x/customer</span>
                                            )}
                                            {item.only_new_users && (
                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">New users</span>
                                            )}
                                            {item.min_order_amount && (
                                                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-medium rounded">Min Rs{item.min_order_amount}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-[12px] text-gray-600">{formatDate(item.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 w-max ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                            {item.status === "ACTIVE" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                            {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md transition-colors hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-md transition-colors hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drawer */}
            <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={drawerTitle} width="md">
                <div className="space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div>
                            <label className="flex justify-between text-[13px] font-medium text-gray-700 mb-1.5">
                                <span>Coupon Code <span className="text-red-500">*</span></span>
                                <button type="button" onClick={handleAutoGenerate} className="text-[11px] text-blue-600 hover:underline">
                                    Auto-generate
                                </button>
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                className="w-full font-mono uppercase rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                placeholder="e.g. SUMMER25"
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description (Internal)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                placeholder="e.g. 10% off sitewide"
                            />
                        </div>
                    </div>

                    {/* Discount */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Discount</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Type</label>
                                <select
                                    value={formData.discount_type}
                                    onChange={e => setFormData(p => ({ ...p, discount_type: e.target.value }))}
                                    className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white"
                                >
                                    <option value="Percentage (%)">Percentage (%)</option>
                                    <option value="Fixed Amount (Rs)">Fixed Amount (Rs)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Value <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.discount_value}
                                    onChange={e => setFormData(p => ({ ...p, discount_value: e.target.value }))}
                                    className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Applies To */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Applies To</label>
                            <select
                                value={formData.applies_to}
                                onChange={e => setFormData(p => ({ ...p, applies_to: e.target.value, applied_product_ids: [], applied_category_ids: [] }))}
                                className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white"
                            >
                                <option value="Entire Order">Entire Order</option>
                                <option value="Specific Products">Specific Products</option>
                                <option value="Specific Categories">Specific Categories</option>
                            </select>
                        </div>

                        {/* Product selector */}
                        {formData.applies_to === "Specific Products" && (
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                                    Select Products <span className="text-red-500">*</span>
                                    {formData.applied_product_ids.length > 0 && (
                                        <span className="ml-2 text-blue-600">({formData.applied_product_ids.length} selected)</span>
                                    )}
                                </label>
                                {products.length === 0 ? (
                                    <p className="text-[12px] text-gray-400 italic">No products found in database.</p>
                                ) : (
                                    <MultiSelectPicker
                                        label="products"
                                        items={products}
                                        selectedIds={formData.applied_product_ids}
                                        onToggle={toggleProduct}
                                    />
                                )}
                            </div>
                        )}

                        {/* Category selector */}
                        {formData.applies_to === "Specific Categories" && (
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                                    Select Categories <span className="text-red-500">*</span>
                                    {formData.applied_category_ids.length > 0 && (
                                        <span className="ml-2 text-blue-600">({formData.applied_category_ids.length} selected)</span>
                                    )}
                                </label>
                                <MultiSelectPicker
                                    label="categories"
                                    items={categories}
                                    selectedIds={formData.applied_category_ids}
                                    onToggle={toggleCategory}
                                />
                            </div>
                        )}
                    </div>

                    {/* Limits */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Limits & Requirements</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Min Order (Rs)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.min_order_amount}
                                    onChange={e => setFormData(p => ({ ...p, min_order_amount: e.target.value }))}
                                    className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    placeholder="None"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Total Usage Limit</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.usage_limit}
                                    onChange={e => setFormData(p => ({ ...p, usage_limit: e.target.value }))}
                                    className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expiry Date (optional)</label>
                            <input
                                type="date"
                                value={formData.expires_at}
                                onChange={e => setFormData(p => ({ ...p, expires_at: e.target.value }))}
                                className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                            />
                        </div>
                        <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.limit_per_customer}
                                    onChange={e => setFormData(p => ({ ...p, limit_per_customer: e.target.checked }))}
                                    className="mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 h-4 w-4"
                                />
                                <div>
                                    <span className="text-[13px] font-medium text-gray-700">Limit to one use per customer</span>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Each customer can only use this coupon once.</p>
                                </div>
                            </label>
                            <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.only_new_users}
                                    onChange={e => setFormData(p => ({ ...p, only_new_users: e.target.checked }))}
                                    className="mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 h-4 w-4"
                                />
                                <div>
                                    <span className="text-[13px] font-medium text-gray-700">Only for new users</span>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Only customers with no previous orders can use this.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 pb-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative inline-block w-10 align-middle">
                                <input
                                    type="checkbox"
                                    checked={formData.status === "ACTIVE"}
                                    onChange={e => setFormData(p => ({ ...p, status: e.target.checked ? "ACTIVE" : "INACTIVE" }))}
                                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-500 transition-all"
                                />
                                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {formData.status === "ACTIVE" ? "Active" : "Inactive"}
                            </span>
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting || !formData.code || formData.discount_value === ""}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {formData.id ? "Update Coupon" : "Create Coupon"}
                            </button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
