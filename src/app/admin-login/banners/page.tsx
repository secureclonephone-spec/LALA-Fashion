"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/admin/Drawer";
import { Plus, Edit, Trash2, Megaphone, AlertTriangle, Truck, Info, Settings, Loader2, ArrowUp, ArrowDown, Tag, X, Copy, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Gradient presets — stored as real CSS background values in custom_color
// (Tailwind gradient classes are purged for dynamic values)
const GRADIENT_PRESETS = [
    { label: "Ocean", css: "linear-gradient(90deg, #2563eb, #22d3ee)" },
    { label: "Sunset", css: "linear-gradient(90deg, #f97316, #ec4899)" },
    { label: "Forest", css: "linear-gradient(90deg, #16a34a, #2dd4bf)" },
    { label: "Royal", css: "linear-gradient(90deg, #7e22ce, #6366f1)" },
    { label: "Fire", css: "linear-gradient(90deg, #dc2626, #fb923c)" },
    { label: "Midnight", css: "linear-gradient(90deg, #111827, #374151)" },
    { label: "Rose Gold", css: "linear-gradient(90deg, #ec4899, #fb7185)" },
    { label: "Emerald", css: "linear-gradient(90deg, #059669, #a3e635)" },
];

const SOLID_PRESETS = [
    "bg-blue-600", "bg-gray-900", "bg-orange-500", "bg-teal-600",
    "bg-purple-600", "bg-red-600", "bg-pink-600", "bg-emerald-600",
    "bg-amber-500", "bg-indigo-600", "bg-rose-600", "bg-white",
];

const BANNER_TYPES = [
    { value: "discount", label: "Discount Offer", icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
    { value: "warning", label: "Warning / Alert", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { value: "new_product", label: "New Products", icon: Info, color: "text-purple-600", bg: "bg-purple-50" },
    { value: "shipping", label: "Shipping Notice", icon: Truck, color: "text-teal-600", bg: "bg-teal-50" },
    { value: "maintenance", label: "Maintenance", icon: Settings, color: "text-gray-600", bg: "bg-gray-100" },
    { value: "coupon", label: "Coupon Code", icon: Tag, color: "text-green-600", bg: "bg-green-50" },
    { value: "info", label: "Info / Notice", icon: Info, color: "text-sky-600", bg: "bg-sky-50" },
];

const defaultForm = {
    message: "",
    button_label: "",
    target_link: "",
    coupon_code: "",
    banner_type: "discount",
    color_preset: "bg-blue-600",
    custom_color: "",
    text_color: "text-white",
    is_active: true,
    start_date: "",
    end_date: "",
};

export default function BannersPage() {
    const supabase = createClient();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ ...defaultForm });
    const [colorTab, setColorTab] = useState<"solid" | "gradient" | "custom">("solid");
    const [copied, setCopied] = useState<string | null>(null);
    const [customInput, setCustomInput] = useState("");
    const [parseError, setParseError] = useState<string | null>(null);

    // Parsing logic for custom colors
    const parseBannerColors = (input: string) => {
        const trimmed = input.trim();
        if (!trimmed) return { value: "", error: null };

        // If it looks like a full CSS value already, return as-is
        if (trimmed.includes('(') || trimmed.includes('linear-gradient')) {
            return { value: trimmed, error: null };
        }

        const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) return { value: "", error: null };

        const formattedColors = parts.map(color => {
            // Hex without # (3 or 6 chars)
            if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color)) {
                return `#${color}`;
            }
            // Hex with #
            if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$/.test(color)) {
                return color;
            }
            // Named color or simple word (3+ chars)
            if (/^[a-zA-Z-]{3,}$/.test(color)) {
                return color;
            }
            return null;
        });

        if (formattedColors.includes(null)) {
            return { value: null, error: "Invalid color format. Use #hex, hex, or names like red, sky-blue." };
        }

        if (formattedColors.length > 1) {
            return { value: `linear-gradient(90deg, ${formattedColors.join(', ')})`, error: null };
        }

        return { value: formattedColors[0]!, error: null };
    };

    // Effect for live parsing
    useEffect(() => {
        if (colorTab === "custom") {
            const { value, error } = parseBannerColors(customInput);
            setParseError(error);
            if (value !== null) {
                setFormData(prev => ({ ...prev, custom_color: value }));
            }
        }
    }, [customInput, colorTab]);

    useEffect(() => { fetchBanners(); /* eslint-disable-next-line */ }, []);

    const fetchBanners = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });
        if (error) console.error("Error fetching banners:", error);
        else setBanners(data || []);
        setIsLoading(false);
    };

    const toggleActive = async (id: string, current: boolean) => {
        const { error } = await supabase.from('banners').update({ is_active: !current }).eq('id', id);
        if (error) alert("Failed: " + error.message);
        else setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this banner?")) return;
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) alert("Failed: " + error.message);
        else setBanners(banners.filter(b => b.id !== id));
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === banners.length - 1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newBanners = [...banners];
        [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
        setBanners(newBanners);
        await Promise.all([
            supabase.from('banners').update({ display_order: newIndex }).eq('id', newBanners[newIndex].id),
            supabase.from('banners').update({ display_order: index }).eq('id', newBanners[index].id),
        ]);
        fetchBanners();
    };

    const getEffectiveColor = () => formData.custom_color
        ? ""  // inline style used
        : formData.color_preset;

    const getInlineStyle = () => formData.custom_color
        ? { background: formData.custom_color }
        : {};

    const openCreate = () => {
        setEditingId(null);
        setFormData({ ...defaultForm });
        setCustomInput("");
        setParseError(null);
        setColorTab("solid");
        setIsDrawerOpen(true);
    };

    const openEdit = (b: any) => {
        setEditingId(b.id);
        // Gradients are stored in custom_color as CSS values; solid presets in color_preset
        const isGradient = GRADIENT_PRESETS.some(g => g.css === b.custom_color);
        const isSolid = SOLID_PRESETS.includes(b.color_preset);
        setColorTab(isGradient ? "gradient" : isSolid ? "solid" : "custom");
        setFormData({
            message: b.message || "",
            button_label: b.button_label || "",
            target_link: b.target_link || "",
            coupon_code: b.coupon_code || "",
            banner_type: b.banner_type || "discount",
            color_preset: isSolid ? b.color_preset : "bg-blue-600",
            custom_color: b.custom_color || "",
            text_color: b.text_color || "text-white",
            is_active: b.is_active ?? true,
            start_date: b.start_date ? new Date(b.start_date).toISOString().split('T')[0] : "",
            end_date: b.end_date ? new Date(b.end_date).toISOString().split('T')[0] : "",
        });
        setCustomInput(b.custom_color || "");
        setParseError(null);
        setIsDrawerOpen(true);
    };

    const openTemplate = (preset: Partial<typeof formData>) => {
        setEditingId(null);
        setFormData({ ...defaultForm, ...preset });
        setCustomInput("");
        setParseError(null);
        setColorTab("solid");
        setIsDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!formData.message.trim()) return alert("Banner message is required.");

        if (colorTab === "custom") {
            const { error } = parseBannerColors(customInput);
            if (error) return alert(`Color Error: ${error}`);
        }

        // Clean conflicting states
        const isCoupon = formData.banner_type === "coupon";
        const effectiveColorPreset = formData.custom_color ? formData.custom_color : formData.color_preset;

        setIsSaving(true);
        const payload: any = {
            message: formData.message,
            button_label: isCoupon ? null : (formData.button_label || null),
            target_link: isCoupon ? null : (formData.target_link || null),
            coupon_code: isCoupon ? formData.coupon_code : null,
            banner_type: formData.banner_type,
            color_preset: effectiveColorPreset,
            custom_color: formData.custom_color || null,
            text_color: formData.text_color,
            is_active: formData.is_active,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
            end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        };

        if (editingId) {
            const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
            if (error) alert("Failed: " + error.message);
            else { setIsDrawerOpen(false); fetchBanners(); }
        } else {
            const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order || 0)) + 1 : 0;
            const { error } = await supabase.from('banners').insert([{ ...payload, display_order: nextOrder }]);
            if (error) alert("Failed: " + error.message);
            else { setIsDrawerOpen(false); fetchBanners(); }
        }
        setIsSaving(false);
    };

    const isCouponType = formData.banner_type === "coupon";
    const isInfoType = formData.banner_type === "info" || formData.banner_type === "maintenance";
    const showCTAFields = !isCouponType;

    // Preview rendering
    const previewBg = formData.custom_color ? "" : formData.color_preset;
    const previewStyle = formData.custom_color
        ? formData.custom_color.includes('gradient')
            ? { backgroundImage: formData.custom_color }
            : { backgroundColor: formData.custom_color }
        : {};

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Announcement Banners</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage top notification bars and site-wide alerts.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus className="h-4 w-4" /> Create Banner
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Templates */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Templates</h2>
                    {BANNER_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
                        <button
                            key={value}
                            onClick={() => openTemplate({
                                banner_type: value,
                                message: value === "discount" ? "Huge Winter Sale – Up to 50% Off" :
                                    value === "warning" ? "Important: Delays in shipping due to weather." :
                                    value === "new_product" ? "Check out our new Summer Collection!" :
                                    value === "shipping" ? "Free National Shipping on orders over Rs 5,000" :
                                    value === "maintenance" ? "System Maintenance scheduled for Sunday 2AM" :
                                    value === "coupon" ? "Use code SAVE20 for 20% off your order!" :
                                    "Important information for our customers.",
                                button_label: value === "discount" ? "Shop Now" : value === "new_product" ? "Explore" : "",
                                color_preset: value === "discount" ? "bg-blue-600" : value === "warning" ? "bg-orange-500" :
                                    value === "new_product" ? "bg-purple-600" : value === "shipping" ? "bg-teal-600" :
                                    value === "maintenance" ? "bg-gray-900" : value === "coupon" ? "bg-emerald-600" : "bg-sky-600",
                                coupon_code: value === "coupon" ? "SAVE20" : "",
                            })}
                            className="w-full bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-400 text-left transition-colors flex items-start gap-3"
                        >
                            <div className={`h-8 w-8 rounded-full ${bg} ${color} flex items-center justify-center shrink-0`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-gray-900 dark:text-white">{label}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {value === "coupon" ? "Copy-to-clipboard code" :
                                     value === "info" ? "No buttons, just close icon" :
                                     value === "maintenance" ? "Close icon only" :
                                     "CTA button + link support"}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Saved Banners */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Saved Banners</h2>
                        <p className="text-[11px] text-gray-500">Top = highest priority</p>
                    </div>
                    <div className="p-0">
                        {isLoading ? (
                            <div className="p-10 flex items-center justify-center gap-2 text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : banners.length === 0 ? (
                            <div className="p-10 text-center text-sm text-gray-500">No banners yet. Create one.</div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {banners.map((b, index) => {
                                    const typeInfo = BANNER_TYPES.find(t => t.value === b.banner_type);
                                    const bgClass = b.custom_color ? "" : (b.color_preset || "bg-gray-900");
                                    const bgStyle = b.custom_color
                                        ? b.custom_color.includes('gradient')
                                            ? { backgroundImage: b.custom_color }
                                            : { backgroundColor: b.custom_color }
                                        : {};
                                    return (
                                        <li key={b.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="flex flex-row sm:flex-col gap-1 items-center justify-center shrink-0">
                                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                                                    <button onClick={() => handleMove(index, 'down')} disabled={index === banners.length - 1} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    {/* Preview */}
                                                    <div className={`w-full py-2 px-4 rounded text-center text-sm font-medium flex items-center justify-center gap-3 ${bgClass} ${b.text_color || "text-white"} shadow-sm border border-black/5 relative`} style={bgStyle}>
                                                        <span className="truncate">{b.message}</span>
                                                        {b.coupon_code && (
                                                            <span className="shrink-0 px-2 py-0.5 text-[11px] font-bold rounded border border-white/50 bg-white/20">
                                                                Copy: {b.coupon_code}
                                                            </span>
                                                        )}
                                                        {!b.coupon_code && b.button_label && (
                                                            <span className="shrink-0 px-2 py-0.5 text-[11px] font-bold uppercase rounded border border-white/50 bg-black/10 whitespace-nowrap">{b.button_label}</span>
                                                        )}
                                                        <span className="shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">✕</span>
                                                    </div>
                                                    {/* Meta */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {typeInfo && (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                                                                <typeInfo.icon className="h-3 w-3" /> {typeInfo.label}
                                                            </span>
                                                        )}
                                                        {b.coupon_code && <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">Coupon: {b.coupon_code}</span>}
                                                        {b.start_date && <span className="text-[10px] text-gray-400">{new Date(b.start_date).toLocaleDateString()} →</span>}
                                                        {b.end_date && <span className="text-[10px] text-gray-400">{new Date(b.end_date).toLocaleDateString()}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex sm:flex-col flex-row items-center sm:items-end justify-between gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <div className="relative inline-flex w-9 h-5 items-center">
                                                            <input type="checkbox" checked={b.is_active} onChange={() => toggleActive(b.id, b.is_active)} className="sr-only" />
                                                            <div className={`w-9 h-5 rounded-full transition-colors ${b.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                            <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${b.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </div>
                                                        <span className={`text-[11px] font-bold ${b.is_active ? 'text-green-600' : 'text-gray-400'}`}>{b.is_active ? 'Live' : 'Off'}</span>
                                                    </label>
                                                    <div className="flex items-center gap-1.5">
                                                        <button onClick={() => openEdit(b)} className="text-[12px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"><Edit className="h-3.5 w-3.5" /> Edit</button>
                                                        <button onClick={() => handleDelete(b.id)} className="text-[12px] font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Drawer / Form */}
            <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={editingId ? "Edit Banner" : "Create Banner"} width="md">
                <div className="space-y-5 pb-8">

                    {/* Banner Type */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Banner Type</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {BANNER_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, banner_type: value })}
                                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 text-center transition-all ${formData.banner_type === value ? `border-gray-900 ${bg}` : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-600"}`}
                                >
                                    <div className={`h-7 w-7 rounded-full ${bg} ${color} flex items-center justify-center`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 leading-tight">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Content</h3>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Banner Message <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
                                placeholder="e.g. Huge Winter Sale – Up to 50% Off"
                            />
                        </div>

                        {/* Coupon Code – only for coupon type */}
                        {isCouponType && (
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Coupon Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.coupon_code}
                                    onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                                    className="w-full rounded-md border border-emerald-500 px-3 py-2 text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none font-mono bg-emerald-50 dark:bg-gray-700 dark:text-white placeholder:text-emerald-400 tracking-widest uppercase"
                                    placeholder="e.g. SAVE20"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">Customers will see a "Copy Code" button. Button Label and Target Link are disabled for coupon banners.</p>
                            </div>
                        )}

                        {/* CTA fields – hidden for coupon/info/maintenance */}
                        {showCTAFields && !isInfoType && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Button Label <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={formData.button_label}
                                        onChange={(e) => setFormData({ ...formData, button_label: e.target.value })}
                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
                                        placeholder="e.g. Shop Now"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Link <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={formData.target_link}
                                        onChange={(e) => setFormData({ ...formData, target_link: e.target.value })}
                                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none bg-white dark:bg-gray-700 dark:text-white placeholder:text-gray-400"
                                        placeholder="/sale or https://..."
                                    />
                                </div>
                            </div>
                        )}

                        {isInfoType && (
                            <p className="text-[12px] text-blue-600 bg-blue-50 rounded-md px-3 py-2">
                                ℹ️ <strong>{formData.banner_type === "maintenance" ? "Maintenance" : "Info"} banners</strong> show only the message and a close (×) icon. No buttons will be displayed.
                            </p>
                        )}
                    </div>

                    {/* Color / Styling */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Styling</h3>

                        {/* Color tabs */}
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
                            {(["solid", "gradient", "custom"] as const).map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => { setColorTab(tab); if (tab !== "custom") setFormData(f => ({ ...f, custom_color: "" })); }}
                                    className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors capitalize ${colorTab === tab ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Solid presets */}
                        {colorTab === "solid" && (
                            <div className="grid grid-cols-6 gap-2">
                                {SOLID_PRESETS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color_preset: color, custom_color: "" })}
                                        className={`h-8 w-full ${color} rounded-md cursor-pointer border-2 transition-all flex items-center justify-center ${color === "bg-white" ? "border-gray-300" : "border-transparent"} ${formData.color_preset === color && !formData.custom_color ? "ring-2 ring-offset-1 ring-gray-900 border-gray-900 scale-105" : "hover:scale-105"}`}
                                    >
                                        {formData.color_preset === color && !formData.custom_color && (
                                            <Check className={`h-3 w-3 ${color === "bg-white" ? "text-gray-900" : "text-white"}`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Gradient presets — stored as CSS in custom_color */}
                        {colorTab === "gradient" && (
                            <div className="grid grid-cols-2 gap-2">
                                {GRADIENT_PRESETS.map(({ label, css }) => (
                                    <button
                                        key={css}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, custom_color: css, color_preset: "bg-gray-900" })}
                                        style={{ background: css }}
                                        className={`h-10 w-full rounded-md cursor-pointer border-2 transition-all flex items-center justify-center relative ${formData.custom_color === css ? "ring-2 ring-offset-1 ring-gray-900 border-white scale-105" : "border-transparent hover:scale-105"}`}
                                    >
                                        <span className="text-[10px] font-bold text-white drop-shadow">{label}</span>
                                        {formData.custom_color === css && (
                                            <Check className="h-3.5 w-3.5 text-white absolute right-2" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Custom color */}
                        {colorTab === "custom" && (
                            <div className="space-y-3">
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300">Custom Color Authority (HEX, Names, or Gradients)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.custom_color?.startsWith("#") ? formData.custom_color : "#3b82f6"}
                                        onChange={(e) => {
                                            setCustomInput(e.target.value);
                                            setFormData({ ...formData, custom_color: e.target.value });
                                        }}
                                        className="h-10 w-14 rounded border border-gray-300 cursor-pointer p-0.5 bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        className={`flex-1 rounded-md border ${parseError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 text-sm font-mono focus:border-black focus:ring-1 focus:ring-black outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors`}
                                        placeholder="e.g. #2193b0, #6dd5ed  or  2193b0, 6dd5ed"
                                    />
                                </div>
                                {parseError && (
                                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {parseError}
                                    </p>
                                )}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <p className="text-[11px] font-semibold text-gray-500 mb-1">Supported Formats:</p>
                                    <ul className="text-[11px] text-gray-400 space-y-0.5 ml-1">
                                        <li>• Single Color: <code className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">#2193b0</code> or <code className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">2193b0</code></li>
                                        <li>• Gradient: <code className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">#2193b0, #6dd5ed</code> or <code className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">2193b0, 6dd5ed</code></li>
                                        <li>• 3+ Colors: <code className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">#ff0000, #00ff00, #0000ff</code></li>
                                        <li>• Advanced: <code className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">linear-gradient(45deg, ...)</code></li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Text color */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Text Color</label>
                            <div className="flex gap-3">
                                {[{ val: "text-white", label: "Light (White)" }, { val: "text-gray-900", label: "Dark (Black)" }].map(({ val, label }) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, text_color: val })}
                                        className={`flex-1 py-1.5 rounded-md border-2 text-[12px] font-semibold transition-all ${formData.text_color === val ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Live preview */}
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">Live Preview</label>
                            <div
                                className={`w-full py-2.5 px-4 rounded-lg text-center text-sm font-medium flex flex-wrap items-center justify-center gap-3 ${previewBg} ${formData.text_color} shadow-sm border border-black/5 relative`}
                                style={previewStyle}
                            >
                                <span>{formData.message || "Your banner message here"}</span>
                                {isCouponType && formData.coupon_code && (
                                    <span className={`shrink-0 px-3 py-1 text-[11px] font-bold rounded border ${formData.text_color === "text-white" ? "border-white/50 bg-white/20" : "border-black/30 bg-black/5"} font-mono tracking-widest`}>
                                        <Copy className="h-3 w-3 inline mr-1" /> {formData.coupon_code}
                                    </span>
                                )}
                                {!isCouponType && !isInfoType && formData.button_label && formData.target_link && (
                                    <span className={`shrink-0 px-3 py-1 text-[11px] font-bold uppercase rounded border ${formData.text_color === "text-white" ? "border-white/50 bg-black/10" : "border-black/50 bg-black/5"}`}>
                                        {formData.button_label} →
                                    </span>
                                )}
                                <span className={`shrink-0 w-5 h-5 rounded-full ${formData.text_color === "text-white" ? "bg-white/20 text-white" : "bg-black/10 text-gray-700"} flex items-center justify-center text-[10px] cursor-pointer`}>✕</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Schedule & Visibility</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date (Optional)</label>
                                <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date (Optional)</label>
                                <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative inline-flex w-10 h-5 items-center">
                                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only" />
                                <div className={`w-10 h-5 rounded-full transition-colors ${formData.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                                <div className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.is_active ? "translate-x-5" : "translate-x-0"}`} />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Activate Banner</span>
                        </label>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button onClick={() => setIsDrawerOpen(false)} disabled={isSaving} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 flex justify-center items-center gap-2 disabled:opacity-50">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Banner"}
                            </button>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
