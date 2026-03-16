import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "E-commerce admin dashboard",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div id="admin-layout" className="flex h-screen w-full bg-[#f6f6f7] dark:bg-[#09090b] overflow-hidden text-gray-900 dark:text-white font-sans transition-colors">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-[1200px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
