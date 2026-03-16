"use client";
import { AddToCart } from "@/components/cart/AddToCart";
import { VariantSelector } from "./VariantSelector";
import { useState } from "react";
import { getVariantInfo } from "@utils/hooks/useVariantInfo";
import { useSearchParams } from "next/navigation";
import { safeParse } from "@utils/helper";
import { HeartIcon, ShareIcon, CheckIcon } from "@heroicons/react/24/outline";

export function ProductActions({
    product,
    productSwatchReview,
}: {
    product: { id?: string; type?: string; colors?: { name: string; hex: string }[]; stock_status?: string };
    productSwatchReview: any;
}) {
    const configurableProductIndexData = (safeParse(
        productSwatchReview?.combinations
    ) || []) as never[];
    const searchParams = useSearchParams();
    const [userInteracted, setUserInteracted] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([]);
    const [quantity, setQuantity] = useState(1);

    const superAttributes = productSwatchReview?.superAttributeOptions
        ? safeParse(productSwatchReview.superAttributeOptions)
        : productSwatchReview?.superAttributes?.edges?.map(
            (e: { node: any }) => e.node
        ) || [];

    const variantInfo = getVariantInfo(
        product?.type === "configurable",
        searchParams.toString(),
        superAttributes,
        productSwatchReview?.combinations
    );

    const handleShare = () => {
        if (typeof navigator !== "undefined" && navigator.share) {
            navigator.share({ title: document.title, url: window.location.href });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            {/* Custom Color Selector */}
            {product?.colors && product.colors.length > 0 && (
                <div className="mb-6 flex flex-col gap-2">
                    <span className="text-sm font-medium dark:text-gray-200">
                        Color: <span className="text-gray-500 dark:text-gray-400 font-normal">
                            {selectedColors.length > 0 ? selectedColors.map(c => c.name).join(', ') : "Select a color"}
                        </span>
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {product.colors.map((c, i) => {
                            const isSelected = selectedColors.some(sc => sc.hex === c.hex);
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        let newSelectedColors = [...selectedColors];
                                        if (isSelected) {
                                            newSelectedColors = newSelectedColors.filter(sc => sc.hex !== c.hex);
                                        } else {
                                            if (quantity === 1) {
                                                newSelectedColors = [c];
                                            } else if (newSelectedColors.length < quantity) {
                                                newSelectedColors.push(c);
                                            } else {
                                                newSelectedColors = [...newSelectedColors.slice(1), c];
                                            }
                                        }
                                        setSelectedColors(newSelectedColors);
                                        setUserInteracted(true);
                                    }}
                                    title={c.name}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                                        isSelected
                                            ? "border-[3px] border-black dark:border-white scale-110 shadow-sm"
                                            : "border border-black dark:border-white hover:scale-105 shadow-sm"
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                    aria-label={`Select color ${c.name}`}
                                >
                                    {isSelected && (
                                        <div className="bg-white/90 rounded-full p-0.5 shadow-sm">
                                            <CheckIcon className="h-4 w-4 text-[#009724] stroke-[3px]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Variant Selector (colors / sizes from Magento if applicable) */}
            <VariantSelector
                variants={variantInfo?.variantAttributes}
                setUserInteracted={setUserInteracted}
                possibleOptions={variantInfo.possibleOptions}
            />

            {/* Quantity + Buy + Save + Share */}
            <div className="flex items-center gap-3 sm:gap-4 mt-4 w-full flex-wrap sm:flex-nowrap">
                <AddToCart
                    index={configurableProductIndexData}
                    productId={product?.id || ""}
                    productSwatchReview={productSwatchReview}
                    userInteracted={userInteracted}
                    selectedColors={selectedColors.length > 0 ? selectedColors : undefined}
                    fallbackStockStatus={product?.stock_status === "IN_STOCK" || product?.stock_status === "ACTIVE"}
                    onQuantityChange={(qty) => {
                        setQuantity(qty);
                        if (selectedColors.length > qty) {
                            setSelectedColors(prev => prev.slice(0, qty));
                        }
                    }}
                />

                {/* Save */}
                <button
                    onClick={() => setSaved((s) => !s)}
                    aria-label="Save to wishlist"
                    className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-200 shrink-0 ${saved
                        ? "border-red-400 bg-red-50 text-red-500 dark:bg-red-900/20 dark:border-red-500"
                        : "border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400"
                        }`}
                >
                    <HeartIcon
                        className={`h-5 w-5 ${saved ? "stroke-red-500 fill-red-100" : ""}`}
                    />
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    aria-label="Share product"
                    className="flex items-center justify-center w-11 h-11 rounded-full border border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 transition-all duration-200 shrink-0"
                >
                    <ShareIcon className="h-5 w-5" />
                </button>
            </div>

        </>
    );
}
