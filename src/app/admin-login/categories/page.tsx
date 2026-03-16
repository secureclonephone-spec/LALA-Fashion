"use client";

import { useState, useEffect, useMemo } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Search, Plus, FolderTree, Folder, ArrowDownUp, Edit, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_id: string | null;
    image_url: string | null;
    show_on_homepage: boolean;
    homepage_order: number;
    created_at: string;
    parent?: { id: string; name: string } | null;
    subcategories?: { id: string }[];
}

interface CategoryWithDepth extends Category {
    depth: number;
}

export default function CategoriesPage() {
    const supabase = createClient();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
    const [isSortOpen, setIsSortOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        slug: "",
        parent_id: "",
        description: "",
        image_url: "",
        show_on_homepage: false,
        homepage_order: 0,
    });

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select(`
                id, name, slug, description, parent_id, image_url, show_on_homepage, homepage_order, created_at,
                parent:categories!parent_id (id, name),
                subcategories:categories!parent_id(id)
            `);

        if (error) {
            console.error("Error fetching categories:", error);
        } else {
            // Need to handle the fact that Supabase sometimes returns parent as an array depending on how relations are set up, 
            // but we expect a single object or null
            const formattedData = (data || []).map(item => ({
                ...item,
                parent: Array.isArray(item.parent) ? item.parent[0] : item.parent
            })) as Category[];
            setCategories(formattedData);
        }
        setIsLoading(false);
    };

    const handleSaveCategory = async () => {
        if (!formData.name) {
            alert("Category Name is required");
            return;
        }
        setIsSubmitting(true);
        const slugToUse = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Prevent circular assignment (a category cannot be its own parent)
        if (formData.id && formData.parent_id === formData.id) {
            alert("A category cannot be its own parent.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            name: formData.name,
            slug: slugToUse,
            parent_id: formData.parent_id !== "" ? formData.parent_id : null,
            description: formData.description,
            image_url: formData.image_url,
            show_on_homepage: formData.show_on_homepage,
            homepage_order: formData.homepage_order
        };

        if (formData.id) {
            // Update existing
            const { error } = await supabase.from('categories').update(payload).eq('id', formData.id);
            if (error) {
                console.error("Error updating category:", error);
                alert("Failed to update: " + error.message);
            } else {
                alert("Category updated successfully!");
                await logAdminAction("Updated Category", "Category", formData.id, { name: payload.name, slug: payload.slug });
                closeDrawer();
                fetchCategories();
            }
        } else {
            // Insert new
            const { error } = await supabase.from('categories').insert(payload);
            if (error) {
                console.error("Error saving category:", error);
                alert("Failed to save: " + error.message);
            } else {
                alert("Category created successfully!");
                await logAdminAction("Created Category", "Category", undefined, { name: payload.name, slug: payload.slug });
                closeDrawer();
                fetchCategories();
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string, hasSubcategories: boolean) => {
        if (hasSubcategories) {
            alert("Cannot delete a category that has sub-categories. Please delete or reassign them first.");
            return;
        }
        if (!confirm("Are you sure you want to delete this category?")) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            alert("Failed to delete: " + error.message);
        } else {
            await logAdminAction("Deleted Category", "Category", id);
            fetchCategories();
        }
    };

    const openCreateDrawer = () => {
        setFormData({ id: "", name: "", slug: "", parent_id: "", description: "", image_url: "", show_on_homepage: false, homepage_order: 0 });
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (category: Category) => {
        setFormData({
            id: category.id,
            name: category.name,
            slug: category.slug,
            parent_id: category.parent_id || "",
            description: category.description || "",
            image_url: category.image_url || "",
            show_on_homepage: category.show_on_homepage || false,
            homepage_order: category.homepage_order || 0
        });
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setFormData({ id: "", name: "", slug: "", parent_id: "", description: "", image_url: "", show_on_homepage: false, homepage_order: 0 });
    };

    // Build hierarchical data
    const hierarchicalCategories = useMemo(() => {
        let processed = [...categories];

        // 1. Search Filter (if active, we just show matching nodes + their parents/children without strict hierarchy visually to avoid missing parents)
        // For simplicity, if searching, we just show a flat list of ALL matching categories, set depth to 0 so they align left
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            processed = processed.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.slug.toLowerCase().includes(lowerQuery));

            // Sort the flat searched list
            processed.sort((a, b) => {
                if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
                if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
                if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
            });
            return processed.map(c => ({ ...c, depth: 0 }));
        }

        // 2. Build Hierarchy when not searching
        const topLevel = processed.filter(c => !c.parent_id);
        const childrenMap = new Map<string, Category[]>();

        processed.forEach(c => {
            if (c.parent_id) {
                if (!childrenMap.has(c.parent_id)) {
                    childrenMap.set(c.parent_id, []);
                }
                childrenMap.get(c.parent_id)!.push(c);
            }
        });

        // 3. Sort logic
        const sortNodes = (nodes: Category[]) => {
            nodes.sort((a, b) => {
                if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
                if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
                if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
            });
        };

        sortNodes(topLevel);

        // 4. Flatten back to array but correctly handle infinite depths: Top Level -> Children -> Grandchildren
        const result: CategoryWithDepth[] = [];
        // Cycle detection limit to prevent crashes from bad data loops
        const appendNodeAndChildren = (node: Category, depth: number, visited: Set<string>) => {
            if (visited.has(node.id)) return; // Prevent infinite loops from bad database relationships
            visited.add(node.id);
            
            result.push({ ...node, depth });
            const children = childrenMap.get(node.id) || [];
            if (children.length > 0) {
                sortNodes(children);
                children.forEach(child => appendNodeAndChildren(child, depth + 1, new Set(visited)));
            }
        };

        topLevel.forEach(tlc => appendNodeAndChildren(tlc, 0, new Set()));

        return result;
    }, [categories, searchQuery, sortOrder]);


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Organize your products into categories and sub-categories.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={openCreateDrawer}
                        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Category
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                {/* Filtering & Search Toolbar */}
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#c9c9c9] hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm transition-colors"
                        >
                            <ArrowDownUp className="h-4 w-4 text-gray-500" />
                            Sort: {sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : sortOrder === 'name-asc' ? 'A-Z' : 'Z-A'}
                            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSortOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                                <div className="absolute right-0 mt-1 w-40 bg-white border border-[#e5e5e5] rounded-md shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <button onClick={() => { setSortOrder('newest'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortOrder === 'newest' ? 'font-medium bg-gray-50' : 'text-gray-700'}`}>Newest First</button>
                                    <button onClick={() => { setSortOrder('oldest'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortOrder === 'oldest' ? 'font-medium bg-gray-50' : 'text-gray-700'}`}>Oldest First</button>
                                    <button onClick={() => { setSortOrder('name-asc'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortOrder === 'name-asc' ? 'font-medium bg-gray-50' : 'text-gray-700'}`}>Name (A-Z)</button>
                                    <button onClick={() => { setSortOrder('name-desc'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortOrder === 'name-desc' ? 'font-medium bg-gray-50' : 'text-gray-700'}`}>Name (Z-A)</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
                                <th className="px-5 py-3 font-medium w-10">
                                    <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" title="Select all" />
                                </th>
                                <th className="px-5 py-3 font-medium">Category Name</th>
                                <th className="px-5 py-3 font-medium">Sub Categories</th>
                                <th className="px-5 py-3 font-medium">Homepage</th>
                                <th className="px-5 py-3 font-medium">Active Products</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
                                        <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                                    </td>
                                </tr>
                            ) : hierarchicalCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center">
                                        <p className="text-sm text-gray-500">No categories found.</p>
                                    </td>
                                </tr>
                            ) : hierarchicalCategories.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" title={`Select ${item.name}`} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div 
                                            className={`flex items-center gap-3`} 
                                            style={{ marginLeft: !searchQuery ? `${item.depth * 24}px` : '0px' }}
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg shadow-inner shrink-0 text-gray-500 overflow-hidden">
                                                {item.image_url ? (
                                                     // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                ) : item.parent_id ? <Folder className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{item.name}</span>
                                                {item.parent_id && <span className="text-[11px] text-gray-500 flex items-center gap-1"><FolderTree className="h-3 w-3" /> Sub-category</span>}
                                                <span className="text-[11px] text-gray-400 font-mono mt-0.5">/{item.slug}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {item.parent_id && !searchQuery ? (
                                            <span className="text-gray-400">-</span>
                                        ) : (
                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-[11px] font-bold text-gray-700">
                                                {item.subcategories?.length || 0}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {item.show_on_homepage ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-green-50 text-green-700 border border-green-100">
                                                Yes (Order: {item.homepage_order})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                                No
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            0 Products (mock)
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditDrawer(item)}
                                                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md transition-colors hover:bg-blue-50"
                                                title="Edit Category"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, (item.subcategories?.length || 0) > 0)}
                                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-md transition-colors hover:bg-red-50"
                                                title="Delete Category"
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

            <Drawer
                open={isDrawerOpen}
                onClose={closeDrawer}
                title={formData.id ? "Edit Category" : "Add Category"}
                width="md"
            >
                <div className="space-y-6">
                    <div className="grid gap-6 bg-white dark:bg-[#09090b] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 dark:bg-[#111113] dark:text-white"
                                placeholder="e.g. Winter Collection"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug (Auto-generated if empty)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400 dark:bg-[#111113] dark:text-white"
                                placeholder="e.g. winter-collection"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Parent Category (Optional)</label>
                            <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                className="w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all dark:bg-[#111113] text-gray-700 dark:text-gray-100"
                            >
                                <option value="">None (Top Level Category)</option>
                                {categories
                                    .filter(c => c.id !== formData.id) // Prevent self-referencing
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category Image (Optional)</label>
                            <div className="flex items-center gap-4">
                                {formData.image_url ? (
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={formData.image_url} alt="Category" className="h-full w-full object-cover" />
                                        <button 
                                            onClick={() => setFormData({ ...formData, image_url: "" })}
                                            className="absolute top-1 right-1 bg-white/80 p-0.5 rounded shadow-sm text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#111113]">
                                        <Folder className="h-6 w-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            // Quick inline upload for category image
                                            const uploadData = new FormData();
                                            uploadData.append('file', file);
                                            uploadData.append('folder', 'category-images');
                                            
                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body: uploadData,
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setFormData({ ...formData, image_url: data.url });
                                                } else {
                                                    alert("Failed to upload image");
                                                }
                                            } catch (err) {
                                                alert("Upload error occurred.");
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 dark:file:bg-[#111113] file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-100 dark:hover:file:bg-gray-800"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Recommended size: 400x400px</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-[13px] font-medium text-gray-900 dark:text-white mb-3">Homepage Display</h4>
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="show_on_homepage"
                                    checked={formData.show_on_homepage}
                                    onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                                <label htmlFor="show_on_homepage" className="text-sm text-gray-700 cursor-pointer">
                                    Show this category on the homepage
                                </label>
                            </div>
                            {formData.show_on_homepage && (
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.homepage_order}
                                        onChange={(e) => setFormData({ ...formData, homepage_order: parseInt(e.target.value) || 0 })}
                                        className="w-full sm:w-1/3 rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            onClick={closeDrawer}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black shadow-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveCategory}
                            disabled={isSubmitting || !formData.name}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-sm disabled:opacity-50"
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

