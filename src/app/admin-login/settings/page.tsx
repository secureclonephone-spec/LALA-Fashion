"use client";

import { useState, useEffect } from "react";
import { Store, CreditCard, Truck, UserCircle, ShieldCheck, BellRing, PaintBucket, Save, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface StoreSettings {
    id?: string;
    store_name: string;
    contact_email: string;
    store_address: string;
    timezone: string;
    default_currency: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState<StoreSettings>({
        store_name: "",
        contact_email: "",
        store_address: "",
        timezone: "UTC",
        default_currency: "USD"
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from("store_settings")
                    .select("*")
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) setSettings(data);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [supabase]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (settings.id) {
                const { error } = await supabase
                    .from("store_settings")
                    .update({
                        store_name: settings.store_name,
                        contact_email: settings.contact_email,
                        store_address: settings.store_address,
                        timezone: settings.timezone,
                        default_currency: settings.default_currency,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", settings.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("store_settings")
                    .insert([{
                        store_name: settings.store_name,
                        contact_email: settings.contact_email,
                        store_address: settings.store_address,
                        timezone: settings.timezone,
                        default_currency: settings.default_currency,
                    }]);
                if (error) throw error;
            }
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const tabs = [
        { id: "general", label: "General", icon: Store },
        { id: "payment", label: "Payment", icon: CreditCard },
        { id: "shipping", label: "Shipping", icon: Truck },
        { id: "admin", label: "Admin Profile", icon: UserCircle },
        { id: "security", label: "Security", icon: ShieldCheck },
        { id: "notifications", label: "Notifications", icon: BellRing },
        { id: "theme", label: "Theme", icon: PaintBucket },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure your store, payments, shipping, and security.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'}`}
                                >
                                    <Icon className={`h-4 w-4 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-base font-semibold text-gray-900">Store Details</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Your store's physical and contact information.</p>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                                            <input type="text" name="store_name" value={settings.store_name} onChange={handleChange} className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
                                            <input type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Address</label>
                                            <textarea rows={3} name="store_address" value={settings.store_address} onChange={handleChange} className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-base font-semibold text-gray-900">Regional & Currency</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                                            <select name="timezone" value={settings.timezone} onChange={handleChange} className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                                                <option value="Asia/Karachi">(GMT+05:00) Islamabad, Karachi</option>
                                                <option value="UTC">UTC</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
                                            <select name="default_currency" value={settings.default_currency} onChange={handleChange} className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                                                <option value="PKR">Pakistani Rupee (PKR/Rs)</option>
                                                <option value="USD">US Dollar (USD/$)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-base font-semibold text-gray-900">Payment Gateways</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Enable and configure how customers pay you.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</h3>
                                            <p className="text-xs text-gray-500 mt-1">Allow customers to pay upon receiving the package.</p>
                                        </div>
                                        <label className="flex items-center cursor-pointer">
                                            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-500 transition-all z-10" defaultChecked />
                                                <div className="overflow-hidden h-5 rounded-full cursor-pointer absolute top-0 left-0 right-0 bottom-0 bg-green-500"></div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Stripe Integration</h3>
                                                <p className="text-xs text-gray-500 mt-1">Accept credit and debit cards globally.</p>
                                            </div>
                                            <label className="flex items-center cursor-pointer">
                                                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                                    <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-gray-400 transition-all z-10" />
                                                    <div className="overflow-hidden h-5 rounded-full cursor-pointer absolute top-0 left-0 right-0 bottom-0 bg-gray-200"></div>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-gray-100 opacity-50 pointer-events-none">
                                            <div>
                                                <label className="block text-[13px] font-medium text-gray-700 mb-1">Stripe Public Key</label>
                                                <input type="text" placeholder="pk_test_..." className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm bg-gray-50" disabled />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                                                <input type="password" placeholder="sk_test_..." className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm bg-gray-50" disabled />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-base font-semibold text-gray-900">Shipping Configuration</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Manage delivery zones and rates.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">Standard Shipping (Nationwide)</h4>
                                                <p className="text-[12px] text-gray-500 mt-0.5">3-5 business days.</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-bold text-gray-900">Rs 200</span>
                                                <button className="text-[12px] text-blue-600 font-medium hover:underline">Edit</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">Express Shipping (Metro Cities)</h4>
                                                <p className="text-[12px] text-gray-500 mt-0.5">1-2 business days.</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-bold text-gray-900">Rs 500</span>
                                                <button className="text-[12px] text-blue-600 font-medium hover:underline">Edit</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-sm font-medium text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                                        Add Shipping Zone
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-base font-semibold text-gray-900">Admin Profile</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Manage your personal account settings.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
                                        <div className="h-20 w-20 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">
                                            A
                                        </div>
                                        <div>
                                            <button className="text-sm font-medium text-white bg-gray-900 rounded-md px-4 py-2 hover:bg-gray-800 transition-colors shadow-sm inline-block mb-2">
                                                Upload new avatar
                                            </button>
                                            <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                            <input type="text" defaultValue="Admin User" className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                            <input type="email" defaultValue="admin@lalafashion.com" className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Current Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                            </div>
                                            <div className="sm:col-start-1">
                                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">New Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-base font-semibold text-gray-900">Security & Access</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">Keep your store admin panel secure.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                                            <p className="text-xs text-gray-500 mt-1">Require an extra security step when logging in.</p>
                                        </div>
                                        <button className="text-[13px] font-medium text-gray-700 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 shadow-sm">Enable 2FA</button>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">New Login Alerts</h3>
                                            <p className="text-xs text-gray-500 mt-1">Get an email when someone logs in from an unrecognized device.</p>
                                        </div>
                                        <label className="flex items-center cursor-pointer">
                                            <div className="relative inline-block w-8 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-green-500 transition-all z-10" defaultChecked />
                                                <div className="overflow-hidden h-4 rounded-full cursor-pointer absolute top-0 left-0 right-0 bottom-0 bg-green-500"></div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 mb-3">Session Timeout</h3>
                                        <select className="w-full max-w-xs rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white">
                                            <option>Inactive for 30 Minutes</option>
                                            <option>Inactive for 1 Hour</option>
                                            <option>Inactive for 4 Hours</option>
                                            <option>Never expire (until logout)</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">IP Whitelist</h3>
                                        <p className="text-xs text-gray-500 mb-3">Restrict admin access to specific IP addresses. Leave empty for open access.</p>
                                        <textarea placeholder="e.g. 192.168.1.1, 10.0.0.1" rows={2} className="w-full rounded-md border border-[#c9c9c9] px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {['theme', 'notifications'].includes(activeTab) && (
                        <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                            <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-10 flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100 shadow-inner">
                                    {activeTab === 'theme' ? <PaintBucket className="h-8 w-8" /> : <BellRing className="h-8 w-8" />}
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2 capitalize">{activeTab} Settings</h2>
                                <p className="text-sm text-gray-500 max-w-md mx-auto">This section is currently being updated. You will be able to configure {activeTab} preferences in a future update.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
