"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import clsx from "clsx";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ConfigurableProductIndexData } from "@/types/types";
import { useAddProduct } from "@utils/hooks/useAddToCart";
import LoadingDots from "@components/common/icons/LoadingDots";
import { getVariantInfo } from "@utils/hooks/useVariantInfo";
import { safeParse } from "@utils/helper";
import { ProductSwatchReview } from "@/types/category/type";

interface AddToCartFormData {
  quantity: number;
  isBuyNow: boolean;
}

function SubmitButton({
  selectedVariantId,
  pending,
  type,
  isSaleable,
}: {
  selectedVariantId: boolean;
  pending: boolean;
  type: string;
  isSaleable: string;
}) {
  const buttonClasses =
    "relative flex flex-1 w-full cursor-pointer h-fit items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-wait opacity-60";

  if (!isSaleable || isSaleable === "") {
    return (
      <button
        aria-disabled
        aria-label="Out of stock"
        type="button"
        disabled
        className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
      >
        Out of Stock
      </button>
    );
  }

  if (!selectedVariantId && type === "configurable") {
    return (
      <button
        aria-disabled
        aria-label="Please select an option"
        type="button"
        disabled={!selectedVariantId}
        className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
      >
        Buy Now
      </button>
    );
  }

  return (
    <button
      aria-disabled={pending}
      aria-label="Buy Now"
      type="submit"
      className={clsx(buttonClasses, {
        "hover:opacity-90": true,
        [disabledClasses]: pending,
      })}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (pending) e.preventDefault();
      }}
    >
      <div className="absolute left-0 ml-4">
        {pending ? <LoadingDots className="mb-3 bg-white" /> : ""}
      </div>
      Buy Now
    </button>
  );
}

export function AddToCart({
  productSwatchReview,
  index,
  productId,
  userInteracted,
  selectedColors,
  onQuantityChange,
  fallbackStockStatus,
}: {
  productSwatchReview: ProductSwatchReview;
  productId: string;
  index: ConfigurableProductIndexData[];
  userInteracted: boolean;
  selectedColors?: { name: string; hex: string }[];
  onQuantityChange?: (qty: number) => void;
  fallbackStockStatus?: boolean;
}) {
  const checkIsSaleable = () => {
    if (fallbackStockStatus === true) return "1"; // "1" maps to true-like in boolean casts
    if (productSwatchReview?.isSaleable) return productSwatchReview.isSaleable;
    // @ts-ignore
    if (productSwatchReview?.stock_status === "IN_STOCK" || productSwatchReview?.stock_status === "ACTIVE") return "1";
    return "";
  };
  const isSaleable = checkIsSaleable();
  const { onAddToCart, isCartLoading } = useAddProduct();
  const router = useRouter();
  const { handleSubmit, setValue, control, register } = useForm<AddToCartFormData>({
    defaultValues: {
      quantity: 1,
      isBuyNow: false,
    },
  });

  const quantity = useWatch({
    control,
    name: "quantity",
  });

  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(Number(quantity) || 1);
    }
  }, [quantity, onQuantityChange]);

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("quantity", Number(quantity) + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("quantity", Math.max(1, Number(quantity) - 1));
  };

  const searchParams = useSearchParams();
  const type = productSwatchReview?.type;

  const superAttributes = productSwatchReview?.superAttributeOptions
    ? safeParse(productSwatchReview.superAttributeOptions)
    : productSwatchReview?.superAttributes?.edges?.map(
      (e) => e.node,
    ) || [];

  const isConfigurable = superAttributes.length > 0;

  const { productid: selectedVariantId, Instock: checkStock } = getVariantInfo(
    isConfigurable,
    searchParams.toString(),
    superAttributes,
    JSON.stringify(index),
  );
  const buttonStatus = !!selectedVariantId;

  const actionWithVariant = async (data: AddToCartFormData) => {
    const pid =
      type === "configurable"
        ? String(selectedVariantId)
        : (String(productId).split("/").pop() ?? "");
    const success = await onAddToCart({
      productId: pid,
      quantity: data.quantity,
      selectedColor: selectedColors?.map(c => c.name).join(', ') || undefined,
    });

    if (success) {
      router.push("/checkout");
    }
  };

  return (
    <>
      {!checkStock && type === "configurable" && userInteracted && (
        <div className="gap-1 px-2 py-1 my-2 font-bold text-red-500 dark:text-red-400">
          <h1>NO STOCK AVAILABLE</h1>
        </div>
      )}
      <form className="flex gap-x-3 sm:gap-x-4 flex-1 w-full min-w-[240px] sm:min-w-0" onSubmit={handleSubmit(actionWithVariant)}>
        <div className="flex items-center justify-center shrink-0">
          <div className="flex items-center rounded-full border-2 border-blue-500">
            <div
              aria-label="Decrease quantity"
              role="button"
              className="flex h-10 w-10 sm:h-12 sm:w-12 cursor-pointer items-center justify-center rounded-l-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]"
              onClick={decrement}
            >
              <MinusIcon className="h-4 w-4" />
            </div>

            <input
              type="hidden"
              {...register("quantity", { valueAsNumber: true })}
            />

            <div className="flex h-10 sm:h-12 min-w-[3rem] sm:min-w-[4rem] items-center justify-center px-2 font-medium text-gray-800 dark:text-white">
              {quantity}
            </div>

            <div
              aria-label="Increase quantity"
              role="button"
              className="flex h-10 w-10 sm:h-12 sm:w-12 cursor-pointer items-center justify-center rounded-r-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]"
              onClick={increment}
            >
              <PlusIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
        <SubmitButton
          pending={isCartLoading}
          selectedVariantId={buttonStatus}
          type={type || ""}
          isSaleable={isSaleable}
        />
      </form>
    </>
  );
}
