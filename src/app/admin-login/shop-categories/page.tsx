"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";
import Image from "next/image";

interface HomepageCategory {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export default function ShopCategoriesAdminPage() {
    const supabase = createClient();
    const [categories, setCategories] = useState<HomepageCategory[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        title: "",
        image_url: "",
        link_url: "",
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchCategories(),
            fetchAllCategories()
        ]);
        setIsLoading(false);
    };

    const fetchAllCategories = async () => {
        const { data } = await supabase.from('categories').select('id, name, slug').order('name');
        setAllCategories(data || []);
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('homepage_categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching homepage categories:", error);
        } else {
            setCategories(data || []);
        }
        setIsLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'homepage-categories');

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
            setFormData({ ...formData, image_url: data.url });
        } catch (error: any) {
            alert('Upload error: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!formData.title) {
            alert("Title is required");
            return;
        }
        if (!formData.image_url) {
             alert("Image URL is required");
             return;
        }
        
        setIsSubmitting(true);

        const payload = {
            title: formData.title,
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            is_active: formData.is_active,
            display_order: formData.display_order
        };

        if (formData.id) {
            const { error } = await supabase.from('homepage_categories').update(payload).eq('id', formData.id);
            if (error) {
                alert("Failed to update: " + error.message);
            } else {
                await logAdminAction("Updated Homepage Category", "HomepageCategory", formData.id);
                setIsDrawerOpen(false);
                fetchCategories();
            }
        } else {
            const newOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order)) + 1 : 0;
            const { error } = await supabase.from('homepage_categories').insert({ ...payload, display_order: newOrder });
            if (error) {
                alert("Failed to save: " + error.message);
            } else {
                await logAdminAction("Created Homepage Category", "HomepageCategory");
                setIsDrawerOpen(false);
                fetchCategories();
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this category?")) return;
        const { error } = await supabase.from('homepage_categories').delete().eq('id', id);
        if (error) alert("Failed to delete: " + error.message);
        else {
            await logAdminAction("Deleted Homepage Category", "HomepageCategory", id);
            fetchCategories();
        }
    };

    const moveCategory = async (id: string, index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const updatedCategories = [...categories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap visual order
        [updatedCategories[index], updatedCategories[swapIndex]] = [updatedCategories[swapIndex], updatedCategories[index]];

        // Update display_order based on new array indices
        const updates = updatedCategories.map((cat, i) => ({
            id: cat.id,
            display_order: i
        }));

        setCategories(updatedCategories.map((c, i) => ({ ...c, display_order: i })));

        // Persist to DB
        for (const update of updates) {
            await supabase.from('homepage_categories').update({ display_order: update.display_order }).eq('id', update.id);
        }
    };

    const openCreateDrawer = () => {
        setFormData({ id: "", title: "", image_url: "", link_url: "", is_active: true, display_order: categories.length });
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (category: HomepageCategory) => {
        setFormData({
            id: category.id,
            title: category.title,
            image_url: category.image_url,
            link_url: category.link_url || "",
            is_active: category.is_active,
            display_order: category.display_order
        });
        setIsDrawerOpen(true);
    };

    const toggleStatus = async (category: HomepageCategory, e: React.MouseEvent) => {
         e.stopPropagation();
         const newStatus = !category.is_active;
         setCategories(categories.map(c => c.id === category.id ? { ...c, is_active: newStatus } : c));
         await supabase.from('homepage_categories').update({ is_active: newStatus }).eq('id', category.id);
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Shop by Category Section</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage the 4 custom category cards displayed on the homepage.</p>
                </div>
                <button
                    onClick={openCreateDrawer}
                    className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50">
                    <p className="text-sm text-gray-600">These 4 items will appear on the homepage using a Liquid Glass UI.</p>
                </div>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No homepage categories found. Add your first category card!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {categories.map((category, index) => (
                            <div key={category.id} onClick={() => openEditDrawer(category)} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button
                                        onClick={(e) => moveCategory(category.id, index, 'up', e)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs font-mono font-medium text-gray-500">{index + 1}</span>
                                    <button
                                        onClick={(e) => moveCategory(category.id, index, 'down', e)}
                                        disabled={index === categories.length - 1}
                                        className="p-1 text-gray-400 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="h-24 w-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative aspect-[3/4]">
                                    <Image src={category.image_url || 'https://via.placeholder.com/400x600?text=Image'} alt={category.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {category.title}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1 truncate max-w-sm flex items-center gap-1">
                                        <LinkIcon className="h-3 w-3" />
                                        {category.link_url || <span className="text-gray-400 italic">No link provided</span>}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 px-2 text-sm">
                                    <button 
                                        onClick={(e) => toggleStatus(category, e)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${category.is_active ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {category.is_active ? 'Active' : 'Draft'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(category.id, e)}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-md transition-colors hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Drawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={formData.id ? "Edit Category Card" : "Add Category Card"}
                width="md"
            >
                <div className="space-y-5 p-1">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Category Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="e.g. Watches"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Category Image <span className="text-red-500">*</span></label>
                        
                        <div className="flex flex-col gap-4">
                            {/* Upload Area */}
                            <div className="flex items-center gap-4">
                                {formData.image_url ? (
                                    <div className="relative w-24 h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                        <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-32 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 shrink-0">
                                        <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                                        <span className="text-[10px] text-gray-400 text-center px-2">No Image</span>
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-700 mb-1.5">Upload a new image (3:4 ratio recommended)</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    {isUploading && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</p>}
                                </div>
                            </div>
                            
                            {/* Or Provide URL Area */}
                            <div className="border-t border-gray-100 pt-3">
                                <label className="block text-[12px] font-medium text-gray-500 mb-1">Or provide image URL directly:</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Link to Existing Category (Recommended)</label>
                        <select
                            onChange={(e) => {
                                const selectedCat = allCategories.find(c => c.id === e.target.value);
                                if (selectedCat) {
                                    setFormData({ 
                                        ...formData, 
                                        title: formData.title || selectedCat.name,
                                        link_url: `/category/${selectedCat.slug}` 
                                    });
                                }
                            }}
                            className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all mb-3 text-gray-700"
                        >
                            <option value="">-- Select a Category --</option>
                            {allCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Target Link URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.link_url}
                            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                            className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="e.g. /category/watches"
                        />
                        <p className="text-xs text-gray-500 mt-1">Where should the user go when they click this category?</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                            Active (Show on homepage)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveCategory}
                            disabled={isSubmitting || !formData.image_url || !formData.title}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save Category
                        </button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
