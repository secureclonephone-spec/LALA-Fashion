"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Loader2, Image as ImageIcon, Clock, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logAdminAction } from "@/utils/admin-logger";
import Image from "next/image";

interface HeroSlide {
    id: string;
    image_url: string;
    link_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export default function HeroSliderAdminPage() {
    const supabase = createClient();
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [timer, setTimer] = useState<number>(5000);
    const [isTimerSaving, setIsTimerSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        image_url: "",
        link_url: "",
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchSlides();
        fetchTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTimer = async () => {
        const { data, error } = await supabase.from('store_settings').select('hero_slider_timer').limit(1).single();
        if (!error && data) {
            setTimer(data.hero_slider_timer || 5000);
        }
    };

    const handleSaveTimer = async () => {
        setIsTimerSaving(true);
        // Assuming there's a single row we can update. If multiple, this needs a specific ID or no eq.
        // Actually, we should select the first row id to update it reliably
        const { data } = await supabase.from('store_settings').select('id').limit(1).single();
        if (data?.id) {
            const { error } = await supabase.from('store_settings').update({ hero_slider_timer: timer }).eq('id', data.id);
            if (error) {
                alert("Failed to save timer: " + error.message);
            } else {
                await logAdminAction("Updated Hero Timer", "StoreSettings", timer.toString());
            }
        }
        setIsTimerSaving(false);
    };

    const fetchSlides = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Error fetching hero slides:", error);
        } else {
            setSlides(data || []);
        }
        setIsLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'hero-slides');

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

    const handleSaveSlide = async () => {
        if (!formData.image_url) {
            alert("Image URL is required");
            return;
        }
        setIsSubmitting(true);

        const payload = {
            image_url: formData.image_url,
            link_url: formData.link_url || null,
            is_active: formData.is_active,
            display_order: formData.display_order
        };

        if (formData.id) {
            const { error } = await supabase.from('hero_slides').update(payload).eq('id', formData.id);
            if (error) {
                alert("Failed to update: " + error.message);
            } else {
                await logAdminAction("Updated Hero Slide", "HeroSlide", formData.id);
                setIsDrawerOpen(false);
                fetchSlides();
            }
        } else {
            const newOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) + 1 : 0;
            const { error } = await supabase.from('hero_slides').insert({ ...payload, display_order: newOrder });
            if (error) {
                alert("Failed to save: " + error.message);
            } else {
                await logAdminAction("Created Hero Slide", "HeroSlide");
                setIsDrawerOpen(false);
                fetchSlides();
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this slide?")) return;
        const { error } = await supabase.from('hero_slides').delete().eq('id', id);
        if (error) alert("Failed to delete: " + error.message);
        else {
            await logAdminAction("Deleted Hero Slide", "HeroSlide", id);
            fetchSlides();
        }
    };

    const moveSlide = async (id: string, index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === slides.length - 1) return;

        const updatedSlides = [...slides];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap visual order
        [updatedSlides[index], updatedSlides[swapIndex]] = [updatedSlides[swapIndex], updatedSlides[index]];

        // Update display_order based on new array indices
        const updates = updatedSlides.map((slide, i) => ({
            id: slide.id,
            image_url: slide.image_url,
            display_order: i
        }));

        setSlides(updatedSlides.map((s, i) => ({ ...s, display_order: i })));

        // Persist to DB
        for (const update of updates) {
            await supabase.from('hero_slides').update({ display_order: update.display_order }).eq('id', update.id);
        }
    };

    const openCreateDrawer = () => {
        setFormData({ id: "", image_url: "", link_url: "", is_active: true, display_order: slides.length });
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (slide: HeroSlide) => {
        setFormData({
            id: slide.id,
            image_url: slide.image_url,
            link_url: slide.link_url || "",
            is_active: slide.is_active,
            display_order: slide.display_order
        });
        setIsDrawerOpen(true);
    };

    const toggleStatus = async (slide: HeroSlide, e: React.MouseEvent) => {
         e.stopPropagation();
         const newStatus = !slide.is_active;
         setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: newStatus } : s));
         await supabase.from('hero_slides').update({ is_active: newStatus }).eq('id', slide.id);
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Hero Slider</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage the main hero images on the homepage.</p>
                </div>
                <button
                    onClick={openCreateDrawer}
                    className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Slide
                </button>
            </div>

            {/* Timer Settings Card */}
            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 leading-none mb-1.5">Auto-Slide Delay</h3>
                        <p className="text-xs text-gray-500 max-w-sm">Time in milliseconds before the slider automatically switches to the next image (e.g. 5000 = 5 seconds).</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1000"
                        step="500"
                        value={timer}
                        onChange={(e) => setTimer(parseInt(e.target.value) || 0)}
                        className="w-28 h-9 text-sm rounded-md border border-[#e5e5e5] px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                        onClick={handleSaveTimer}
                        disabled={isTimerSaving}
                        className="h-9 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {isTimerSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#e5e5e5] bg-gray-50/50">
                    <p className="text-sm text-gray-600">Drag & drop is simulated by Up/Down arrows to control the display order.</p>
                </div>
                {isLoading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">Loading slides...</p>
                    </div>
                ) : slides.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No slides found. Add your first hero slide!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {slides.map((slide, index) => (
                            <div key={slide.id} onClick={() => openEditDrawer(slide)} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button
                                        onClick={(e) => moveSlide(slide.id, index, 'up', e)}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs font-mono font-medium text-gray-500">{index + 1}</span>
                                    <button
                                        onClick={(e) => moveSlide(slide.id, index, 'down', e)}
                                        disabled={index === slides.length - 1}
                                        className="p-1 text-gray-400 hover:bg-gray-200 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="h-20 w-40 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                    <Image src={slide.image_url || 'https://via.placeholder.com/800x400?text=No+Image'} alt="Slide" fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        Link: {slide.link_url || <span className="text-gray-400 italic">No link</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 truncate max-w-sm">
                                        {slide.image_url}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 px-2 text-sm">
                                    <button 
                                        onClick={(e) => toggleStatus(slide, e)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${slide.is_active ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        {slide.is_active ? 'Active' : 'Draft'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDelete(slide.id, e)}
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
                title={formData.id ? "Edit Slide" : "Add Hero Slide"}
                width="md"
            >
                <div className="space-y-5 p-1">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Hero Image <span className="text-red-500">*</span></label>
                        
                        <div className="flex flex-col gap-4">
                            {/* Upload Area */}
                            <div className="flex items-center gap-4">
                                {formData.image_url ? (
                                    <div className="relative w-32 h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                        <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-32 h-20 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 shrink-0">
                                        <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                                        <span className="text-[10px] text-gray-400">No Image</span>
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-700 mb-1.5">Upload a new image</p>
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
                        <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Target Link URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.link_url}
                            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                            className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="e.g. /category/shoes"
                        />
                        <p className="text-xs text-gray-500 mt-1">Where should the user go when they click this slide?</p>
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
                            onClick={handleSaveSlide}
                            disabled={isSubmitting || !formData.image_url}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Save Slide
                        </button>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
