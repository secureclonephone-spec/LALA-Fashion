"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
}

interface ProductReview {
    id: string;
    product_id: string;
    name: string;
    rating: number;
    comment: string | null;
    image_url: string | null;
    created_at: string;
    products?: { name: string };
}

export default function RatingsAdminPage() {
    const supabase = createClient();
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        product_id: "",
        name: "",
        rating: 5,
        comment: "",
        image_url: "",
        review_date: new Date().toISOString().split('T')[0]  // default: today
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        
        // Fetch products for dropdown
        const { data: productsData } = await supabase
            .from('products')
            .select('id, name')
            .order('name');
        
        if (productsData) setProducts(productsData);

        // Fetch reviews
        const { data: reviewsData, error } = await supabase
            .from('product_reviews')
            .select('*, products(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching reviews:", error);
        } else {
            setReviews(reviewsData || []);
        }
        
        setIsLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'reviews');

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
            setFormData(prev => ({ ...prev, image_url: data.url }));
        } catch (error: Omit<Error, 'name'> | any) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const reviewData: any = {
                product_id: formData.product_id,
                name: formData.name,
                rating: formData.rating,
                comment: formData.comment || null,
                image_url: formData.image_url || null,
                created_at: formData.review_date
                    ? new Date(formData.review_date + 'T12:00:00').toISOString()
                    : new Date().toISOString(),
            };

            if (formData.id) {
                // Update
                const { error } = await supabase
                    .from('product_reviews')
                    .update(reviewData)
                    .eq('id', formData.id);

                if (error) throw error;
                await logAdminAction("Updated Custom Review", "ProductReviews", formData.id);
            } else {
                // Create
                const { error } = await supabase
                    .from('product_reviews')
                    .insert([reviewData]);

                if (error) throw error;
                await logAdminAction("Created Custom Review", "ProductReviews", formData.name);
            }

            setIsDrawerOpen(false);
            setFormData({ id: "", product_id: "", name: "", rating: 5, comment: "", image_url: "", review_date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error: any) {
            console.error("Error saving review:", error);
            alert("Failed to save review: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (review: ProductReview) => {
        setFormData({
            id: review.id,
            product_id: review.product_id,
            name: review.name,
            rating: review.rating,
            comment: review.comment || "",
            image_url: review.image_url || "",
            review_date: review.created_at
                ? new Date(review.created_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
        });
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this custom review?")) return;

        const { error } = await supabase
            .from('product_reviews')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Failed to delete review: " + error.message);
        } else {
            setReviews(reviews.filter(r => r.id !== id));
            await logAdminAction("Deleted Custom Review", "ProductReviews", id);
        }
    };

    const openCreateDrawer = () => {
        setFormData({ id: "", product_id: products[0]?.id || "", name: "", rating: 5, comment: "", image_url: "", review_date: new Date().toISOString().split('T')[0] });
        setIsDrawerOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Custom Ratings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Add custom product reviews and star ratings to your store.</p>
                </div>
                <button
                    onClick={openCreateDrawer}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Add Custom Rating
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400">
                    No custom reviews found. Click the button above to create one.
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Product</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Reviewer Name</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Rating</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Comment</th>
                                <th className="p-4 font-medium text-gray-600 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id} className="border-b dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 text-gray-900 dark:text-gray-100">
                                        {review.products?.name || "Unknown Product"}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-3">
                                            {review.image_url ? (
                                                <Image src={review.image_url} alt={review.name} width={32} height={32} className="rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
                                                    {review.name.charAt(0)}
                                                </div>
                                            )}
                                            {review.name}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center text-yellow-400">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} className={i >= review.rating ? "text-gray-300 dark:text-gray-600" : ""} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {review.comment || "-"}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                                title="Edit Review"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Drawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={formData.id ? "Edit Custom Review" : "Add Custom Review"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product</label>
                        <select
                            value={formData.product_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                            className="w-full border dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        >
                            <option value="">Select a product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reviewer Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full border dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Star Rating (1-5)</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.rating}
                            onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                            className="w-full border dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Date</label>
                        <input
                            type="date"
                            value={formData.review_date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData(prev => ({ ...prev, review_date: e.target.value }))}
                            className="w-full border dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This date will be shown to customers in the reviews popup.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Comment</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full border dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                            placeholder="This product is amazing..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reviewer Image (Optional)</label>
                        {formData.image_url ? (
                            <div className="relative w-24 h-24 mb-3 border dark:border-gray-700 rounded-lg overflow-hidden">
                                <Image src={formData.image_url} alt="Reviewer" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
                                        <p className="text-sm text-gray-500">Uploading...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <ImageIcon className="text-gray-400 mb-2" size={24} />
                                        <p className="text-sm text-gray-500 font-medium">Click or drag image to upload</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t dark:border-gray-800 flex justify-end gap-3 z-10 relative bg-gray-50/50 dark:bg-gray-900/50">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="px-4 py-2 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                            {formData.id ? "Update Rating" : "Save Rating"}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    );
}
