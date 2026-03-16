"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Package,
    Layers,
    ShoppingCart,
    Users,
    CheckCircle,
    Ticket,
    Activity,
    Mail,
    Newspaper,
    Image as ImageIcon,
    Settings,
    Star,
    MessageSquare,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/admin-login", icon: LayoutDashboard },
    { name: "Products", href: "/admin-login/products", icon: Package },
    { name: "Categories", href: "/admin-login/categories", icon: Layers },
    // Homepage Sections
    { name: "Hero Slider", href: "/admin-login/hero", icon: ImageIcon },
    { name: "Shop Categories", href: "/admin-login/shop-categories", icon: Layers },
    { name: "Featured Products", href: "/admin-login/featured", icon: Star },
    { name: "Popular Products", href: "/admin-login/popular", icon: Activity },
    // ---
    { name: "Orders", href: "/admin-login/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin-login/users", icon: Users },
    { name: "Approve", href: "/admin-login/approve", icon: CheckCircle },
    { name: "Coupons", href: "/admin-login/coupons", icon: Ticket },
    { name: "Activity", href: "/admin-login/activity", icon: Activity },
    { name: "Contact", href: "/admin-login/contact", icon: Mail },
    { name: "Newsletter", href: "/admin-login/newsletter", icon: Newspaper },
    { name: "Banners", href: "/admin-login/banners", icon: Layers },
    { name: "Custom Ratings", href: "/admin-login/ratings", icon: MessageSquare },
    { name: "Settings", href: "/admin-login/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex h-full w-[240px] flex-col bg-[#ebebeb] dark:bg-[#09090b] border-r border-[#e5e5e5] dark:border-gray-800 shrink-0 transition-colors">
            <div className="flex h-16 items-center px-4 border-b border-transparent dark:border-gray-800">
                <Link href="/admin-login" className="flex items-center gap-2">
                    <Image src="/Logo.png" alt="Store Logo" width={110} height={32} className="object-contain dark:invert" priority />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navigation.map((item) => {
                    const isDashboard = item.href === "/admin-login";
                    const isActive = isDashboard ? pathname === "/admin-login" : pathname?.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-[#d4d4d4] dark:bg-[#111113] text-gray-900 dark:text-white"
                                    : "text-[#4a4a4a] dark:text-white hover:bg-[#d4d4d4]/50 dark:hover:bg-[#111113] hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-gray-900 dark:text-white" : "text-[#5c5c5c] dark:text-white group-hover:text-gray-900 dark:group-hover:text-white")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
