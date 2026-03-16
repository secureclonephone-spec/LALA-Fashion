"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Search, Plus, Trash2, ArrowUp, ArrowDown, Loader2, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";
import Image from "next/image";

export default function FeaturedProductsAdminPage() {
    const supabase = createClient();
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        // Fetch featured
        const { data: featured } = await supabase
            .from('products')
            .select(`id, name, image_url, sale_price, stock_status, featured_order`)
            .eq('is_featured', true)
            .order('featured_order', { ascending: true });

        setFeaturedProducts(featured || []);

        // Fetch all non-featured
        const { data: others } = await supabase
            .from('products')
            .select(`id, name, sm:image_url, sku, stock_status`)
            .eq('is_featured', false)
            .limit(100);

        setAllProducts(others || []);
        setIsLoading(false);
    };

    const handleFeatureProduct = async (product: any) => {
        setIsAdding(true);
        const newOrder = featuredProducts.length > 0 ? Math.max(...featuredProducts.map(p => p.featured_order || 0)) + 1 : 0;
        
        const { error } = await supabase
            .from('products')
            .update({ is_featured: true, featured_order: newOrder })
            .eq('id', product.id);

        if (error) {
            alert("Failed to feature product: " + error.message);
        } else {
            await logAdminAction("Featured Product", "Product", product.id);
            setIsDrawerOpen(false);
            fetchData();
        }
        setIsAdding(false);
    };

    const handleRemoveFeature = async (id: string) => {
        if (!confirm("Are you sure you want to remove this product from the featured list?")) return;
        const { error } = await supabase
            .from('products')
            .update({ is_featured: false, featured_order: 0 })
            .eq('id', id);

        if (error) alert("Failed to remove: " + error.message);
        else {
            await logAdminAction("Unfeatured Product", "Product", id);
            fetchData();
        }
    };

    const moveProduct = async (id: string, index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === featuredProducts.length - 1) return;

        const updatedProducts = [...featuredProducts];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap visual order
        [updatedProducts[index], updatedProducts[swapIndex]] = [updatedProducts[swapIndex], updatedProducts[index]];

        setFeaturedProducts(updatedProducts.map((p, i) => ({ ...p, featured_order: i })));

        // Persist to DB
        // To avoid constraints/race conditions, we update both concurrently
        const updates = updatedProducts.map((p, i) => 
            supabase.from('products').update({ featured_order: i }).eq('id', p.id)
        );
        
        await Promise.all(updates);
    };

    const filteredSearch = allProducts.filter(p => 
        (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Featured Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Select and order products to feature on the homepage.</p>
                </div>
                <button
                    onClick={() => { setSearchQuery(""); setIsDrawerOpen(true); }}
                    className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Select Product
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50">
                    <p className="text-sm text-gray-600">Use the Up/Down arrows to control the display order on the homepage.</p>
                </div>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">Loading...</p>
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No featured products selected. Add some to highlight them on the homepage!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {featuredProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => moveProduct(product.id, index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs font-mono font-medium text-gray-500">{index + 1}</span>
                                    <button
                                        onClick={() => moveProduct(product.id, index, 'down')}
                                        disabled={index === featuredProducts.length - 1}
                                        className="p-1 text-gray-400 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="h-14 w-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                    <Image src={product.image_url || 'https://via.placeholder.com/150'} alt="Product" layout="fill" objectFit="cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Rs {product.sale_price}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 px-2 text-sm">
                                     <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${product.stock_status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        {product.stock_status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleRemoveFeature(product.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-md transition-colors hover:bg-red-50"
                                        title="Remove from featured"
                                    >
                                        <Trash2 className="h-5 w-5" />
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
                title="Select Product to Feature"
                width="md"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                        {filteredSearch.length === 0 ? (
                             <div className="p-8 text-center text-gray-500 text-sm">No available products found.</div>
                        ) : (
                            filteredSearch.map((product) => (
                                <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden shrink-0 border border-gray-200">
                                             <img src={product.sm || 'https://via.placeholder.com/150'} alt="p" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500 truncate">SKU: {product.sku}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFeatureProduct(product)}
                                        disabled={isAdding}
                                        className="shrink-0 flex items-center justify-center bg-gray-900 text-white rounded-md px-3 py-1.5 text-xs font-medium hover:bg-gray-800 disabled:opacity-50 w-full sm:w-auto"
                                    >
                                        Feature
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
