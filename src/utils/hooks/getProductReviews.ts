import { createClient } from "@/utils/supabase/server";

export async function getProductReviews(productId: string) {
  try {
    const supabase = await createClient();
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return reviews.map((review: any) => ({
      node: {
        __typename: "ProductReview",
        name: review.name,
        title: review.comment?.substring(0, 50) || "Review",
        rating: review.rating,
        comment: review.comment || "",
        createdAt: review.created_at,
        customer: {
          name: review.name,
          imageUrl: review.image_url || "",
        }
      }
    }));
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product reviews:", {
        message: error.message,
        productId,
      });
    }
    return [];
  }
}
