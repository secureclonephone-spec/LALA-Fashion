"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Drawer({ open, onClose, title, children, width = "md" }: DrawerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!isMounted) return null;

    const widthClasses = {
        sm: "w-full sm:w-[400px]",
        md: "w-full sm:w-[540px]",
        lg: "w-full sm:w-[720px]",
        xl: "w-full sm:w-[960px]",
        full: "w-full",
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "admin-drawer fixed inset-y-0 right-0 z-50 flex flex-col h-screen bg-white dark:bg-[#09090b] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    widthClasses[width],
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header (fixed at top) */}
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e5e5e5] dark:border-gray-800 px-6 bg-white dark:bg-[#09090b] z-10 transition-colors">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111113] hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#111113] p-6">
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}
