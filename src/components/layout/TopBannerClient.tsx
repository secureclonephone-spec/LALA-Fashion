"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X, Copy, Check } from "lucide-react";

interface Banner {
    id: string;
    message: string;
    button_label?: string | null;
    target_link?: string | null;
    coupon_code?: string | null;
    banner_type?: string | null;
    color_preset?: string | null;
    custom_color?: string | null;
    text_color?: string | null;
}

export default function TopBannerClient({ banner }: { banner: Banner }) {
    const [dismissed, setDismissed] = useState(false);
    const [copied, setCopied] = useState(false);

    if (dismissed) return null;

    const handleCopyCoupon = async () => {
        if (!banner.coupon_code) return;
        try {
            await navigator.clipboard.writeText(banner.coupon_code);
        } catch {
            const el = document.createElement("textarea");
            el.value = banner.coupon_code;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const isCoupon = banner.banner_type === "coupon" && banner.coupon_code;
    const isInfoOrMaintenance = banner.banner_type === "info" || banner.banner_type === "maintenance";
    const hasCTA = !isCoupon && !isInfoOrMaintenance && banner.button_label && banner.target_link;

    const bgClass = banner.custom_color ? "" : (banner.color_preset || "bg-gray-900");
    const bgStyle: React.CSSProperties = banner.custom_color
        ? banner.custom_color.includes('gradient')
            ? { backgroundImage: banner.custom_color }
            : { background: banner.custom_color }
        : {};
    const textClass = banner.text_color || "text-white";
    const isLight = textClass === "text-white";

    const btnClass = isLight
        ? "border-white/50 bg-white/15 hover:bg-white/25 text-white"
        : "border-black/30 bg-black/5 hover:bg-black/10 text-gray-900";
    const closeClass = isLight
        ? "hover:bg-white/20 text-white/70 hover:text-white"
        : "hover:bg-black/10 text-black/50 hover:text-black";

    return (
        <div
            className={`w-full py-2 px-4 text-[13px] sm:text-sm font-medium flex items-center justify-center gap-3 ${bgClass} ${textClass}`}
            style={bgStyle}
        >
            <span className="flex-1 text-center">{banner.message}</span>

            {isCoupon && (
                <button
                    onClick={handleCopyCoupon}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded border transition-all font-mono ${btnClass}`}
                >
                    {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> {banner.coupon_code}</>}
                </button>
            )}

            {hasCTA && (
                <Link
                    href={banner.target_link!}
                    className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded border transition-all ${btnClass}`}
                >
                    {banner.button_label} <ArrowRight className="h-3 w-3" />
                </Link>
            )}

            <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss banner"
                className={`shrink-0 p-1 rounded-full transition-colors ${closeClass}`}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
