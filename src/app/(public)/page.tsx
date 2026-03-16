import { createClient } from "@/utils/supabase/server";
import ImageCarousel from "@components/home/ImageCarousel";
import ProductCarousel from "@components/home/ProductCarousel";
import CategoryCarousel from "@components/home/CategoryCarousel";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";

export const revalidate = 0; // Dynamic fetch

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch Hero Slides
  const { data: heroSlides } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const { data: storeSettings } = await supabase
    .from('store_settings')
    .select('hero_slider_timer')
    .limit(1)
    .single();

  const heroOptions = {
    timer: storeSettings?.hero_slider_timer || 5000,
    images: heroSlides?.map((slide: any) => ({
      image: slide.image_url,
      link: slide.link_url || "",
    })) || []
  };

  // 2. Fetch Featured Products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .eq('is_featured', true)
    .order('featured_order', { ascending: true });

  // 3. Fetch Categories
  const { data: categories } = await supabase
    .from('homepage_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // 4. Fetch New Products
  const { data: newProducts } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .order('created_at', { ascending: false })
    .limit(10);

  // 5. Fetch Popular Products
  const { data: popularProducts } = await supabase
    .from('products')
    .select('*, product_reviews(rating)')
    .eq('is_popular', true)
    .order('popular_order', { ascending: true });

  const mapProducts = (products: any[]) => {
      if (!products) return [];
      return products.map(p => {
          const reviewList: { rating: number }[] = p.product_reviews || [];
          const reviewCount = reviewList.length;
          const avgRating = reviewCount > 0
              ? reviewList.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
              : 0;
          return {
              id: p.id,
              name: p.name,
              sku: p.sku || p.id,
              baseImageUrl: p.image_url || p.sm,
              price: p.mrp || p.sale_price || p.price,
              specialPrice: p.sale_price || null,
              type: "simple",
              urlKey: p.slug || p.id,
              isSaleable: p.stock_status === 'ACTIVE',
              rating: avgRating,
              reviewCount,
          };
      });
  }

  return (
    <>
      <MobileSearchBar />
      <section className="w-full max-w-screen-2xl mx-auto pb-4 px-4 xss:px-7.5">
        {heroOptions.images.length > 0 && <ImageCarousel options={heroOptions} />}
        
        {featuredProducts && featuredProducts.length > 0 && (
          <ProductCarousel title="Featured Products" products={mapProducts(featuredProducts)} layout="carousel" />
        )}

        {categories && categories.length > 0 && (
          <CategoryCarousel categories={categories} />
        )}

        {newProducts && newProducts.length > 0 && (
          <ProductCarousel 
            title="New Arrivals" 
            description="Checkout our latest additions to the store." 
            products={mapProducts(newProducts)} 
            layout="grid" 
          />
        )}

        {popularProducts && popularProducts.length > 0 && (
          <ProductCarousel title="Popular Products" products={mapProducts(popularProducts)} layout="carousel" />
        )}
      </section>
    </>
  );
}
