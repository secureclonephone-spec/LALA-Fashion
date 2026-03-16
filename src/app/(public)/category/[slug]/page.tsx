import dynamicImport from "next/dynamic";
import Grid from "@/components/theme/ui/grid/Grid";
import NotFound from "@/components/theme/search/not-found";
import { isArray } from "@/utils/type-guards";
import { createClient } from "@/utils/supabase/server";
import {
  generateMetadataForPage,
  getFilterAttributes,
  buildProductFilters,
} from "@/utils/helper";
import SortOrder from "@/components/theme/filters/SortOrder";
import { SortByFields } from "@/utils/constants";
import MobileFilter from "@/components/theme/filters/MobileFilter";
import FilterList from "@/components/theme/filters/FilterList";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";

const Pagination = dynamicImport(
  () => import("@/components/catalog/Pagination"),
);
const ProductGridItems = dynamicImport(
  () => import("@/components/catalog/product/ProductGridItems"),
);

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single();

  return generateMetadataForPage(`category/${slug}`, {
    title: category?.name || "Category",
    description: category?.description || `Explore our ${category?.name || 'category'} collection`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const supabase = await createClient();

  // 1. Fetch Category Details
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('slug', slug)
    .single();

  if (catError || !category) {
    return <NotFound msg="Category not found" />;
  }

  // 2. Setup Pagination and Sorting
  const {
    page,
    sort,
  } = (sParams || {}) as { [key: string]: string };

  const itemsPerPage = 12;
  const currentPage = page ? parseInt(page) - 1 : 0;
  const sortValue = sort || "name-asc";
  const selectedSort = SortByFields.find((s) => s.key === sortValue) || SortByFields[0];

  const { filterObject } = buildProductFilters(sParams || {});

  // 3. Fetch Products
  let query = supabase
    .from('products')
    .select(`
        *,
        product_reviews(rating),
        category:categories!products_category_id_fkey (id, name)
    `, { count: 'exact' })
    .eq('category_id', category.id)
    .eq('stock_status', 'ACTIVE'); // Only show active products


  // Apply Filters if any
  if (filterObject.color) {
    // This is a simplified filter application for Supabase
    // In search page it used GraphQL, here we translate to Supabase query
    // NOTE: This assumes 'colors' column exists and contains the hex/name
    // However, buildProductFilters uses IDs. 
    // For now, we'll implement a basic category fetch. 
    // Filters might need more complex adjustments if they depend on specific schema.
  }

  // Apply Sorting
  if (selectedSort.sortKey === 'NAME') {
    query = query.order('name', { ascending: !selectedSort.reverse });
  } else if (selectedSort.sortKey === 'PRICE') {
    query = query.order('sale_price', { ascending: !selectedSort.reverse });
  } else {
    query = query.order('created_at', { ascending: !selectedSort.reverse });
  }

  // Apply Pagination
  const from = currentPage * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const { data: products, count, error: prodError } = await query.range(from, to);

  const totalCount = count || 0;
  
  // 4. Map Supabase data to component expectations
  // NOTE: ProductGridItems reads `minimumPrice` as the discounted price (specialPrice).
  // `price` = original MRP (shown as strikethrough when on sale)
  // `minimumPrice` = sale price (shown as green discounted price)
  const mappedProducts = products?.map(p => {
    const reviewList: { rating: number }[] = p.product_reviews || [];
    const reviewCount = reviewList.length;
    const avgRating = reviewCount > 0
      ? reviewList.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
      : (p.rating || 0);

    const hasSalePrice = p.sale_price && p.mrp && Number(p.sale_price) < Number(p.mrp);

    return {
      ...p,
      baseImageUrl: p.image_url,
      // price = MRP (original/strikethrough)
      price: p.mrp?.toString() || p.sale_price?.toString() || "0",
      // minimumPrice = sale_price (green discounted) - only when actually cheaper
      minimumPrice: hasSalePrice ? p.sale_price.toString() : undefined,
      urlKey: p.slug || p.id,
      type: 'simple',
      priceHtml: { currencyCode: "PKR" },
      rating: avgRating,
      reviewCount,
      isSaleable: "1",
      stock_status: "IN_STOCK",
    };
  });



  const [filterAttributes] = await Promise.all([
    getFilterAttributes(),
  ]);

  return (
    <>
      <MobileSearchBar />
      
      <div className="mx-auto w-full max-w-screen-2xl px-4 xss:px-7.5 mt-10">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight capitalize">
            {category.name}
        </h1>
        {category.description && (
            <p className="text-gray-500 mt-2 max-w-2xl text-sm sm:text-base">
                {category.description}
            </p>
        )}
      </div>

      <div className="my-10 hidden gap-4 md:flex md:items-baseline md:justify-between w-full mx-auto max-w-screen-2xl px-4 xss:px-7.5">
        <FilterList filterAttributes={filterAttributes} />
        <SortOrder sortOrders={SortByFields} title="Sort by" />
      </div>

      <div className="flex items-center justify-between gap-4 py-8 md:hidden mx-auto w-full max-w-screen-2xl px-4 xss:px-7.5">
        <MobileFilter filterAttributes={filterAttributes} />
        <SortOrder sortOrders={SortByFields} title="Sort by" />
      </div>

      {!mappedProducts || mappedProducts.length === 0 ? (
        <NotFound msg={`No products found in ${category.name}`} />
      ) : (
        <Grid className="grid grid-flow-row grid-cols-2 gap-5 lg:gap-11.5 w-full max-w-screen-2xl mx-auto md:grid-cols-3 lg:grid-cols-4 px-4 xss:px-7.5">
          <ProductGridItems products={mappedProducts} />
        </Grid>
      )}

      {totalCount > itemsPerPage && (
        <nav
          aria-label="Category pagination"
          className="my-10 block items-center sm:flex"
        >
          <Pagination
            itemsPerPage={itemsPerPage}
            itemsTotal={totalCount}
            currentPage={currentPage}
          />
        </nav>
      )}
    </>
  );
}
