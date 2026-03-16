import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ProductDetailSkeleton,
  RelatedProductSkeleton,
} from "@/components/common/skeleton/ProductSkeleton";
import {
  BASE_SCHEMA_URL,
  baseUrl,
  getImageUrl,
  NOT_IMAGE,
  PRODUCT_TYPE,
} from "@/utils/constants";
import HeroCarousel from "@/components/common/slider/HeroCarousel";
import { createClient } from "@/utils/supabase/server";
import { isArray } from "@/utils/type-guards";
import {
  ProductNode,
  ProductVariantNode,
  ProductData,
} from "@/components/catalog/type";
import { RelatedProductsSection } from "@components/catalog/product/RelatedProductsSection";
import ProductInfo from "@components/catalog/product/ProductInfo";
import { LRUCache } from "@/utils/LRUCache";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import { HeroCarouselShimmer } from "@components/common/slider";

const productCache = new LRUCache<ProductNode>(100, 10);
export const dynamic = "force-dynamic";

export interface SingleProductResponse {
  product: ProductNode;
}

interface VariantImage {
  baseImageUrl: string;
  name: string;
}

async function getSingleProduct(urlKey: string) {
  const supabase = await createClient();
  let query = supabase.from('products').select('*');

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(urlKey)) {
    query = query.or(`slug.eq.${urlKey},id.eq.${urlKey}`);
  } else {
    query = query.eq('slug', urlKey);
  }

  const { data: product, error } = await query.single();

  if (error) {
    console.error("Supabase Error fetching product:", error);
  }

  if (!product) return null;

  const productImages = Array.isArray(product.images) ? [...product.images] : [];
  if (product.image_url && !productImages.includes(product.image_url)) {
    productImages.unshift(product.image_url);
  }

  return {
    id: product.id,
    name: product.name,
    sku: product.sku || product.id,
    urlKey: product.slug || product.id,
    description: product.description || "",
    shortDescription: product.description?.substring(0, 150) || "",
    type: "simple",
    price: product.mrp || product.sale_price || 0,
    minimumPrice: product.sale_price || product.mrp || 0,
    specialPrice: product.sale_price || null,
    baseImageUrl: product.image_url || productImages[0] || "",
    orderCount: 0,
    rating: product.rating || 0,
    reviewCount: product.reviews_count || 0,
    quickAttributes: [
      { label: "Made in", value: product.made_in },
      { label: "Design", value: product.design },
      { label: "Delivery", value: product.delivery_info || "Standard" },
    ].filter(attr => attr.value),
    variants: {
      edges: productImages.map((img: string, idx: number) => ({
        node: {
          baseImageUrl: img,
          name: `${product.name} image ${idx + 1}`
        }
      }))
    },
    reviews: { edges: [] },
    colors: product.colors || [],
    stock_status: product.stock_status || "IN_STOCK"
  } as unknown as ProductNode;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ urlProduct: string[] }>;
  searchParams: Promise<{ type: string }>;
}) {
  const { urlProduct } = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath);
  if (!product) return notFound();

  const imageUrl = getImageUrl(product?.baseImageUrl, baseUrl, NOT_IMAGE);
  const productJsonLd = {
    "@context": BASE_SCHEMA_URL,
    "@type": PRODUCT_TYPE,
    name: product?.name,
    description: product?.description,
    sku: product?.sku,
  };

  const reviews = Array.isArray(product?.reviews?.edges)
    ? product?.reviews.edges.map((e) => e.node)
    : [];

  const VariantImages = isArray(product?.variants?.edges)
    ? product?.variants.edges.map(
      (edge: { node: ProductVariantNode }) => edge.node,
    )
    : [];

  return (
    <>
      <MobileSearchBar />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 xl:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch h-full">
          <div className="flex flex-col h-full w-full">
            <Suspense fallback={<HeroCarouselShimmer />}>
              {isArray(VariantImages) ? (
                <HeroCarousel
                  images={
                    (VariantImages as unknown as VariantImage[])?.map(
                      (image) => ({
                        src:
                          getImageUrl(image.baseImageUrl, baseUrl, NOT_IMAGE) ||
                          "",
                        altText: image.name || "",
                      }),
                    ) || []
                  }
                />
              ) : (
                <HeroCarousel
                  images={[
                    {
                      src: imageUrl || "",
                      altText: product?.name || "product image",
                    },
                  ]}
                />
              )}
            </Suspense>
          </div>
          <div className="flex flex-col h-full w-full">
            <Suspense fallback={<ProductDetailSkeleton />}>
              <ProductInfo
                product={product as ProductData}
                slug={fullPath}
                reviews={reviews as any}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <Suspense fallback={<RelatedProductSkeleton />}>
        <RelatedProductsSection fullPath={fullPath} />
      </Suspense>
    </>
  );
}
