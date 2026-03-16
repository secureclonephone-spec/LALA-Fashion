import Link from "next/link";
import { FC } from "react";
import Grid from "@/components/theme/ui/grid/Grid";
import AddToCartButton from "@/components/theme/ui/AddToCartButton";
import { NextImage } from "@/components/common/NextImage";
import { Price } from "@/components/theme/ui/Price";
import { Rating } from "@/components/common/Rating";

type ProductCardProps = {
  currency: string;
  price: string;
  specialPrice?: string;
  imageUrl: string;
  product: {
    urlKey: string;
    name: string;
    id: string;
    type: string;
    isSaleable?: string;
    stock_status?: string;
  };
  sizes?: string;
  priority?: boolean;
  rating?: number;
  reviewCount?: number;
};

export const ProductCard: FC<ProductCardProps> = ({
  currency,
  price,
  specialPrice,
  imageUrl,
  product,
  sizes = "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
  priority = false,
  rating = 0,
  reviewCount = 0,
}) => {
  return (
    <Grid.Item
      key={product.id}
      className="animate-fadeIn gap-y-4.5 flex flex-col"
    >
      <div className="group relative overflow-hidden rounded-lg">
        <Link href={`/product/${product.urlKey}`} aria-label={`View ${product.name}`}>
          <div className="aspect-[353/283] h-auto truncate rounded-lg">
            <NextImage
              alt={product?.name || "Product image"}
              src={imageUrl}
              width={353}
              height={283}
              sizes={sizes}
              className={`rounded-lg bg-neutral-100 object-cover transition duration-300 ease-in-out group-hover:scale-105`}
              priority={priority}
            />
          </div>
        </Link>

        <div
          className={`hidden lg:block absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-x-4 rounded-full border-[1.5px] border-white bg-white/70 px-4 py-1.5 text-xs font-semibold text-black opacity-0 shadow-2xl backdrop-blur-md duration-300 group-hover:opacity-100 dark:text-white`}
        >
          <AddToCartButton productType={product.type} productId={product.id} productUrlKey={product.urlKey} isSaleable={product?.isSaleable} fallbackStockStatus={product?.stock_status === "IN_STOCK"} />
        </div>
        <div
          className={`block lg:hidden absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-x-4 rounded-full border-[1.5px] border-white bg-white/70 px-3 py-0.5 md:px-4 md:py-1.5 text-xs font-semibold text-black opacity-100 shadow-2xl backdrop-blur-md duration-300 group-hover:opacity-100 dark:text-white`}
        >
          <AddToCartButton productType={product.type} productId={product.id} productUrlKey={product.urlKey} isSaleable={product?.isSaleable} fallbackStockStatus={product?.stock_status === "IN_STOCK"} />
        </div>
      </div>

      <div>
        <h3 className="mb-2.5 text-sm font-medium md:text-lg">
          {product?.name}
        </h3>

        <div className="flex items-center gap-2">
          {product?.type === "configurable" && (
            <span className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              As low as
            </span>
          )}
          {product?.type === "simple" && specialPrice ? (
            <>
              <div className="flex items-center gap-2">
                <Price
                  amount={specialPrice}
                  className="text-xs font-semibold md:text-sm text-[#009724]"
                  currencyCode={currency}
                />
                <Price
                  amount={price}
                  className="text-[10px] md:text-xs text-gray-400 line-through"
                  currencyCode={currency}
                />
              </div>
            </>
          ) : (
            <Price
              amount={price}
              className="text-xs font-semibold md:text-sm"
              currencyCode={currency}
            />
          )}
        </div>

        {reviewCount > 0 && (
          <div className="mt-1.5">
            <Rating
              length={5}
              star={rating}
              reviewCount={reviewCount}
              size="size-3.5"
            />
          </div>
        )}
      </div>
    </Grid.Item>
  );
};
