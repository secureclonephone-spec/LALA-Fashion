import { Suspense } from "react";
import Cart from "@/components/cart";
import UserAccount from "@components/customer/credentials";
import ThemeSwitcherWrapper from "@components/theme/theme-switch";
import { IconSkeleton } from "@/components/common/skeleton/IconSkeleton";
import { SessionManager } from "@/providers";
import { Truck } from "lucide-react";
import Link from "next/link";

export function CartAndUserActions() {
  return (
    <div className="flex max-w-fit items-center gap-2 md:gap-4 font-outfit">
      <Link 
        href="/track-order" 
        className="hidden sm:flex items-center gap-2.5 px-4 lg:h-11 text-sm font-bold text-slate-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all duration-300 group"
      >
        <Truck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
        <span className="hidden md:inline">Track Order</span>
      </Link>
      <div className="flex">
        <ThemeSwitcherWrapper />
      </div>
      <div className="hidden lg:block">
        <Cart />
      </div>
      <Suspense fallback={<IconSkeleton />}>
        <div className="hidden lg:block">
          <SessionManager>
            <UserAccount />
          </SessionManager>
        </div>
      </Suspense>
    </div>
  );
}