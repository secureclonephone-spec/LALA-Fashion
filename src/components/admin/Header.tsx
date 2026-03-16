"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, Plus, Download, Moon, Sun, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Simple hook to close dropdowns on outside click
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
}

export default function Header() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    useOutsideClick(notifRef, () => setShowNotifications(false));
    useOutsideClick(userRef, () => setShowUserMenu(false));

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#e5e5e5] dark:border-gray-800 bg-[#f6f6f7] dark:bg-[#09090b] px-4 md:px-8 transition-colors">
            {/* Left side: Mobile Menu Toggle + Global Search */}
            <div className="flex items-center gap-4 flex-1">
                <button className="md:hidden p-1.5 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md">
                    <Menu className="h-5 w-5" />
                </button>
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search products, orders, users... (Press '/')"
                        className="h-8 w-full rounded-md border border-[#c9c9c9] dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white pl-8 pr-3 text-sm shadow-inner-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                    />
                </div>
            </div>

            {/* Right side: Quick Actions, Theme, Notifications, User */}
            <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <div className="hidden lg:flex items-center gap-2 mr-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-[#c9c9c9] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md shadow-sm transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Theme Toggle (Placeholder) */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
                >
                    {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-1.5 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-gray-900"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 cursor-pointer">
                                    <p className="text-sm text-gray-900 dark:text-gray-100"><span className="font-semibold">Order #12234</span> placed by Sarah.</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 mins ago</p>
                                </div>
                                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                    <p className="text-sm text-gray-900 dark:text-gray-100">Low stock alert for <span className="font-semibold">Nike Air Max</span>.</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                                </div>
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
                                <Link href="/admin/activity" className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">View all activity</Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="relative h-8 w-8 rounded-full overflow-hidden border border-[#d4d4d4] dark:border-gray-700 shadow-sm flex items-center justify-center bg-white dark:bg-gray-800 transition-transform hover:scale-105 outline-none focus:ring-2 focus:ring-black ml-1"
                    >
                        <Image src="/Favicon.png" alt="Admin Profile" className="object-cover" fill sizes="32px" />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Store Administrator</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@lala-fashion.com</p>
                            </div>
                            <div className="p-1.5">
                                <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                                    <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    My Profile
                                </Link>
                                <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                                    <Settings className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    Store Settings
                                </Link>
                            </div>
                            <div className="p-1.5 border-t border-gray-100 dark:border-gray-800">
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">
                                    <LogOut className="h-4 w-4 text-red-500" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
