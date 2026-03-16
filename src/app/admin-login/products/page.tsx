"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Search, Filter, Download, Plus, MoreVertical, Star, CheckCircle2, XCircle, ChevronDown, Loader2, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";

export default function ProductsPage() {
    const supabase = createClient();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");


    const [formData, setFormData] = useState({
        id: "",
        name: "",
        sku: "",
        stock_status: "ACTIVE",
        sale_price: "",
        mrp: "",
        category_id: "",
        description: "",
        made_in: "",
        design: "",
        delivery_info: "Usually ships in 24 hours",
        available_qty: "0",
        image_url: "",
        images: [] as string[],
        colors: [] as { name: string; hex: string }[]
    });

    useEffect(() => {
        fetchProductsAndCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProductsAndCategories = async () => {
        setIsLoading(true);
        // Fetch Categories
        const { data: cats } = await supabase.from('categories').select('id, name, parent_id');
        if (cats) setCategories(cats);

        // Fetch Products
        const { data: prods, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories!products_category_id_fkey (id, name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
        } else {
            setProducts(prods || []);
        }
        setIsLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImageUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('folder', 'product-images');

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Upload failed');
                }

                const data = await res.json();
                newImageUrls.push(data.url);
            } catch (error: any) {
                console.error('Upload error:', error.message);
                // Continue to the next file even if one fails
            }
        }

        if (newImageUrls.length > 0) {
            setFormData(prev => {
                const updatedImages = [...prev.images, ...newImageUrls];
                return {
                    ...prev,
                    images: updatedImages,
                    // Auto-set the first uploaded image as main if none is currently selected
                    image_url: prev.image_url || updatedImages[0] || ""
                };
            });
        }
        setIsUploading(false);
    };

    const handleSetMainImage = (url: string) => {
        setFormData(prev => ({ ...prev, image_url: url }));
    };

    const handleRemoveImage = (urlToRemove: string) => {
        setFormData(prev => {
            const updatedImages = prev.images.filter(url => url !== urlToRemove);
            // If we removed the main image, reset the main image to the first available or empty
            const newMainImage = prev.image_url === urlToRemove 
                ? (updatedImages[0] || "") 
                : prev.image_url;
                
            return {
                ...prev,
                images: updatedImages,
                image_url: newMainImage
            };
        });
    };
    const handleAddColor = () => {
        setFormData(prev => ({ ...prev, colors: [...prev.colors, { name: "", hex: "#000000" }] }));
    };

    const handleColorChange = (index: number, field: 'name' | 'hex', value: string) => {
        setFormData(prev => {
            const newColors = [...prev.colors];
            newColors[index] = { ...newColors[index], [field]: value };
            return { ...prev, colors: newColors };
        });
    };

    const handleRemoveColor = (index: number) => {
        setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
    };

    const handleSaveProduct = async () => {
        if (!formData.name || !formData.sale_price || !formData.category_id) {
            alert("Name, Price, and Category are required");
            return;
        }

        setIsSubmitting(true);
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const payload = {
            name: formData.name,
            slug: slug,
            sku: formData.sku || `SKU-${Date.now().toString().slice(-6)}`,
            stock_status: formData.stock_status,
            sale_price: Number(formData.sale_price),
            mrp: formData.mrp ? Number(formData.mrp) : null,
            category_id: formData.category_id,
            description: formData.description,
            made_in: formData.made_in,
            design: formData.design,
            delivery_info: formData.delivery_info,
            available_qty: Number(formData.available_qty),
            image_url: formData.image_url,
            images: formData.images,
            colors: formData.colors
        };

        let err;
        if (formData.id) {
            // Update
            const { error } = await supabase.from('products').update(payload).eq('id', formData.id);
            err = error;
        } else {
            // Insert
            const { error } = await supabase.from('products').insert(payload);
            err = error;
        }

        if (err) {
            alert("Failed to save product: " + err.message);
        } else {
            alert("Product saved successfully!");
            await logAdminAction(formData.id ? "Updated Product" : "Created Product", "Product", formData.id ? formData.id : undefined, { name: payload.name, sku: payload.sku });
            setIsDrawerOpen(false);
            fetchProductsAndCategories();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert("Failed to delete: " + error.message);
        } else {
            await logAdminAction("Deleted Product", "Product", id);
            fetchProductsAndCategories();
        }
    };

    const openCreateDrawer = () => {
        setFormData({
            id: "", name: "", sku: "", stock_status: "ACTIVE", sale_price: "", mrp: "",
            category_id: "", description: "", made_in: "", design: "",
            delivery_info: "Usually ships in 24 hours", available_qty: "0",
            image_url: "", images: [], colors: []
        });
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (product: any) => {
        setFormData({
            id: product.id,
            name: product.name,
            sku: product.sku || "",
            stock_status: product.stock_status || "ACTIVE",
            sale_price: product.sale_price ? product.sale_price.toString() : "",
            mrp: product.mrp ? product.mrp.toString() : "",
            category_id: product.category_id || "",
            description: product.description || "",
            made_in: product.made_in || "",
            design: product.design || "",
            delivery_info: product.delivery_info || "",
            available_qty: product.available_qty ? product.available_qty.toString() : "0",
            image_url: product.image_url || "",
            images: product.images || (product.image_url ? [product.image_url] : []),
            colors: product.colors || []
        });
        setIsDrawerOpen(true);
    };

    const downloadCSV = () => {
        if (products.length === 0) return;
        const headers = ["ID", "Name", "SKU", "Status", "Price", "MRP", "Category", "Stock"];
        const rows = products.map(p => [
            p.id,
            `"${p.name}"`,
            p.sku,
            p.stock_status,
            p.sale_price,
            p.mrp || "",
            `"${p.category?.name || ""}"`,
            p.available_qty
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredProducts = products.filter(product => {
        // Search Filter
        if (searchQuery &&
            !(product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
        }

        // Tab Filter
        if (activeTab === "active" && product.stock_status !== "ACTIVE" && product.stock_status !== "LOW STOCK") return false;
        if (activeTab === "draft" && product.stock_status !== "DRAFT") return false;
        if (activeTab === "archived" && product.stock_status !== "ARCHIVED" && product.stock_status !== "OUT OF STOCK") return false;

        // Status Dropdown Filter
        if (statusFilter !== "all" && product.stock_status !== statusFilter) return false;

        // Category Dropdown Filter
        if (categoryFilter !== "all" && product.category_id !== categoryFilter) return false;

        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your inventory, pricing, and variants.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-1.5 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={openCreateDrawer}
                        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar Tabs */}
                <div className="flex items-center gap-6 px-4 border-b border-[#e5e5e5]">
                    {["All", "Active", "Draft", "Archived"].map((tab) => (
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
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 px-3 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none pr-8 relative"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="LOW STOCK">Low Stock</option>
                            <option value="OUT OF STOCK">Out of Stock</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-9 px-3 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none pr-8 relative max-w-[150px] truncate"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.2em 1.2em` }}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
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
                                <th className="px-5 py-3 font-medium">Product</th>
                                <th className="px-5 py-3 font-medium">Category</th>
                                <th className="px-5 py-3 font-medium">Stock</th>
                                <th className="px-5 py-3 font-medium">Price</th>
                                <th className="px-5 py-3 font-medium">Ratings</th>
                                <th className="px-5 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading products...</p>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-500 text-sm">No products found.</td>
                                </tr>
                            ) : filteredProducts.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{item.name}</span>
                                                <span className="text-[11px] text-gray-500 font-medium">{item.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                                            {item.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[13px] font-semibold text-gray-900">{item.available_qty || 0} in stock</span>
                                            {item.stock_status === 'ACTIVE' && <span className="text-[11px] font-medium text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Active</span>}
                                            {item.stock_status === 'OUT OF STOCK' && <span className="text-[11px] font-medium text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3" />Out of Stock</span>}
                                            {item.stock_status === 'LOW STOCK' && <span className="text-[11px] font-medium text-orange-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Low Stock</span>}
                                            {item.stock_status === 'DRAFT' && <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Draft</span>}
                                            {item.stock_status === 'ARCHIVED' && <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Archived</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-semibold text-gray-900">Rs {item.sale_price}</span>
                                            {item.mrp && <span className="text-[11px] text-gray-400 line-through">Rs {item.mrp}</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center text-orange-400">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className={`h-3 w-3 ${star <= Math.round(item.rating || 0) ? 'fill-current' : 'text-gray-200 fill-current'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[11px] text-gray-500 font-medium">{item.rating || 0} ({item.reviews_count || 0} reviews)</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditDrawer(item)}
                                                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md transition-colors hover:bg-blue-50">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-md transition-colors hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-[#e5e5e5] bg-gray-50/30 flex items-center justify-between text-[13px] text-gray-500">
                    Showing {filteredProducts.length} products
                </div>
            </div>

            <Drawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={formData.id ? "Edit Product" : "Add New Product"}
                width="lg"
            >
                <div className="space-y-6">
                    <div className="grid gap-6 bg-white dark:bg-[#09090b] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">Basic Information</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 dark:bg-[#111113] dark:text-white"
                                        placeholder="e.g. Nike Air Max"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">SKU</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, sku: `PRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}` })}
                                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                            >
                                                Auto Generate
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 dark:bg-[#111113] dark:text-white"
                                            placeholder="e.g. NK-AMX-01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock Status</label>
                                        <select
                                            value={formData.stock_status}
                                            onChange={e => setFormData({ ...formData, stock_status: e.target.value })}
                                            className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="DRAFT">Draft</option>
                                            <option value="LOW STOCK">Low Stock</option>
                                            <option value="OUT OF STOCK">Out of Stock</option>
                                            <option value="ARCHIVED">Archived</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4 mt-2">Pricing & Inventory</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sale Price (Rs) <span className="text-green-500">*</span></label>
                                    <input
                                        type="number"
                                        value={formData.sale_price}
                                        onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                                        className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 dark:bg-[#111113] dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">MRP (Rs)</label>
                                    <input
                                        type="number"
                                        value={formData.mrp}
                                        onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                        className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 dark:bg-[#111113] dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Available Qty</label>
                                    <input
                                        type="number"
                                        value={formData.available_qty}
                                        onChange={e => setFormData({ ...formData, available_qty: e.target.value })}
                                        className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-4 mt-2">Organization</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-4 mt-2">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Color Variants</h3>
                                <button type="button" onClick={handleAddColor} className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                    <Plus className="h-3 w-3" /> Add Color
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.colors.map((color, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={color.hex}
                                            onChange={(e) => handleColorChange(idx, 'hex', e.target.value)}
                                            className="h-9 w-9 p-0 border-0 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Color Name (e.g. Navy Blue)"
                                            value={color.name}
                                            onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                                            className="flex-1 rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-1.5 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                        />
                                        <button type="button" onClick={() => handleRemoveColor(idx)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/30">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {formData.colors.length === 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No color variants added.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 bg-white dark:bg-[#09090b] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">Description & Details</h3>
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none dark:bg-[#111113] dark:text-white"
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Made In</label>
                                <input
                                    type="text"
                                    value={formData.made_in}
                                    onChange={e => setFormData({ ...formData, made_in: e.target.value })}
                                    className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Design Details</label>
                                <input
                                    type="text"
                                    value={formData.design}
                                    onChange={e => setFormData({ ...formData, design: e.target.value })}
                                    className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Info</label>
                                <input
                                    type="text"
                                    value={formData.delivery_info}
                                    onChange={e => setFormData({ ...formData, delivery_info: e.target.value })}
                                    className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                             <h3 className="text-sm font-semibold text-gray-900">Images & Media</h3>
                             <label className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                {isUploading ? 'Uploading...' : 'Add Images'}
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                             </label>
                        </div>
                        
                        {formData.images.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                No images uploaded yet.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {formData.images.map((url, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                            formData.image_url === url ? 'border-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Product Image ${idx + 1}`} className="w-full h-full object-cover" />
                                            
                                            {/* Actions Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 hidden group-hover:flex items-center justify-between">
                                                {formData.image_url !== url ? (
                                                    <button 
                                                        onClick={() => handleSetMainImage(url)}
                                                        className="text-[11px] font-medium text-white bg-black/50 hover:bg-black/80 px-2 py-1 rounded backdrop-blur-sm"
                                                    >
                                                        Set Main
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-blue-300 flex items-center gap-1 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                                        <Star className="h-3 w-3 fill-current" /> Main
                                                    </span>
                                                )}
                                                
                                                <button 
                                                    onClick={() => handleRemoveImage(url)}
                                                    className="text-white hover:text-red-400 p-1 rounded-sm transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            
                                            {/* Persistent Main Badge for the selected main image */}
                                            {formData.image_url === url && (
                                                <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 group-hover:hidden md:group-hover:flex">
                                                    <Star className="h-3 w-3 fill-current" /> Main
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[11px] text-gray-500 mt-2">
                            The main image will be shown on the product listing and homepage. You can upload multiple images at once.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 pb-8">
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black shadow-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveProduct}
                            disabled={isSubmitting || !formData.name || !formData.sale_price || !formData.category_id}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {formData.id ? "Update Product" : "Save Product"}
                        </button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
