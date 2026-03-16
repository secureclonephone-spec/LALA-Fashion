
import { ProductData } from "../type";
import { ProductDescription } from "./ProductDescription";
import { getProductWithSwatchAndReview } from "@/utils/hooks/getProductSwatchAndReview";
import { ProductReview } from "@/types/category/type";
import { getProductReviews } from "@utils/hooks/getProductReviews";

export default async function ProductInfo({
  product,
  slug,
  reviews,
}: {
  product: ProductData;
  slug: string;
  reviews: ProductReview[];
}) {
  const productSwatchReview = await getProductWithSwatchAndReview(slug);
  // Fetch real reviews from Supabase
  const getAllreviews = await getProductReviews(product?.id?.split("/").pop() || '');

  // Unwrapped nodes for computing avg/total
  const supabaseReviews = getAllreviews.map((edge: any) => edge.node);
  const totalReview = supabaseReviews.length;
  const avgRating = totalReview > 0
    ? supabaseReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReview
    : 0;

  return (
    <ProductDescription
      product={product}
      productSwatchReview={productSwatchReview}
      slug={slug}
      reviews={getAllreviews as any}  // ReviewDetail expects edge-wrapped { node: {...} }[] format
      totalReview={totalReview}
      avgRating={avgRating}
    />
  );
}
