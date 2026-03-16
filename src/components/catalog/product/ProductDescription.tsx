import { Price } from "@/components/theme/ui/Price";
import { Rating } from "@/components/common/Rating";
import { ProductMoreDetails } from "./ProductMoreDetail";
import Prose from "@components/theme/search/Prose";
import { ProductData, ProductReviewNode } from "../type";
import { safeCurrencyCode, safePriceValue } from "@utils/helper";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { ProductActions } from "./ProductActions";
import { Suspense } from "react";

export function ProductDescription({
  product,
  reviews,
  totalReview,
  productSwatchReview,
  avgRating,
}: {
  product: ProductData;
  slug: string;
  reviews: ProductReviewNode[];
  avgRating: number;
  totalReview: number;
  productSwatchReview: any;
}) {
  const priceValue = safePriceValue(product);
  const currencyCode = safeCurrencyCode(product);

  const additionalData =
    productSwatchReview?.attributeValues?.edges?.map(
      (e: { node: any }) => e.node
    ) || [];

  return (
    <div className="flex flex-col h-full w-full">
      {/* 1 ── Breadcrumb */}
      <div className="hidden lg:flex flex-col gap-3 shrink-0 mb-3">
        <a
          href="/"
          className="w-fit text-sm font-medium text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          Home /
        </a>
      </div>

      {/* 2 ── Product Name */}
      <h1 className="font-outfit text-2xl md:text-3xl lg:text-4xl font-semibold mb-3">
        {product?.name || ""}
      </h1>

      {/* 3 ── Price */}
      <div className="flex gap-2 items-baseline mb-4">
        {product?.type === "configurable" && (
          <p className="text-sm text-gray-500 dark:text-gray-400">As low as</p>
        )}
        {product?.type === "simple" ? (
          <div className="flex items-center gap-3">
            <Price
              amount={String(product?.specialPrice || product?.minimumPrice || product?.price)}
              currencyCode={currencyCode}
              className="font-outfit text-2xl md:text-3xl font-bold"
              style={(product?.specialPrice || (product?.minimumPrice && String(product?.minimumPrice) !== String(product?.price))) ? { color: '#009724' } : {}}
            />
            {((product?.specialPrice && String(product?.specialPrice) !== String(product?.price)) || (product?.minimumPrice && String(product?.minimumPrice) !== String(product?.price))) && (
              <Price
                amount={String(product?.price)}
                currencyCode={currencyCode}
                className="text-lg md:text-xl text-gray-400 line-through"
              />
            )}
          </div>
        ) : (
          <Price
            amount={String(priceValue)}
            currencyCode={currencyCode}
            className="font-outfit text-2xl md:text-3xl font-bold"
          />
        )}
      </div>

      {/* 4 ── Order Count (above rating) */}
      {product?.orderCount != null && product.orderCount > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          <LockClosedIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            {product.orderCount.toLocaleString()} orders
          </span>
        </div>
      )}

      {/* 5 ── Star Rating + Write a review */}
      <div className="flex items-center gap-3 mb-4">
        <Rating
          length={5}
          star={avgRating}
          reviewCount={totalReview}
          className=""
        />
      </div>

      {/* 6 ── Quick Attributes (Made in / Design / Delivery) — one per line */}
      {Array.isArray(product?.quickAttributes) &&
        product.quickAttributes.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-b border-neutral-200 dark:border-neutral-700 py-4 mb-5">
            {product.quickAttributes.map((attr) => (
              <div key={attr.label} className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 w-20 shrink-0">
                  {attr.label}:
                </span>
                <span
                  className={`text-sm font-semibold ${attr.highlight
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-neutral-800 dark:text-neutral-200"
                    }`}
                >
                  {attr.value}
                </span>
              </div>
            ))}
          </div>
        )}

      {/* 7 ── Short Description */}
      {product?.shortDescription && (
        <Prose
          className="mb-5 text-base text-neutral-700 dark:text-neutral-300 font-light leading-relaxed"
          html={product.shortDescription}
        />
      )}

      {/* 8 ── Description + Ratings accordions */}
      <ProductMoreDetails
        additionalData={additionalData}
        description={product?.description ?? ""}
        reviews={Array.isArray(reviews) ? reviews : []}
        totalReview={totalReview}
        productId={product?.id ?? ""}
      />

      {/* 9, 10, 11, 12 ── VariantSelector + Qty + Buy + Save + Share (client) */}
      <div className="mt-auto pt-6 flex flex-col w-full">
        <Suspense fallback={<div className="h-24 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-xl mt-4" />}>
          <ProductActions
            product={{ id: product?.id, type: product?.type, colors: product?.colors, stock_status: product?.stock_status }}
            productSwatchReview={productSwatchReview}
          />
        </Suspense>
      </div>
    </div>
  );
}
