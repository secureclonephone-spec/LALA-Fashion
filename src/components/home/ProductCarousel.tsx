import { FC } from "react";
import { ThreeItemGrid } from "./ThreeItemGrid";
import Theme from "./ProductCarouselTheme";

interface ProductCarouselProps {
  title?: string;
  description?: string;
  products: any[];
  layout?: 'grid' | 'carousel';
}

const ProductCarousel: FC<ProductCarouselProps> = async ({
  title,
  description = "Discover the latest trends! Fresh products just added—shop new styles, tech, and essentials before they're gone.",
  products,
  layout = 'carousel',
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  if (layout === 'grid') {
    return (
      <ThreeItemGrid
        title={title || "Products"}
        description={description}
        products={products.slice(0, 3)}
      />
    );
  }

  return (
    <Theme
      title={title || "Products"}
      description={description}
      products={products}
    />
  );
};

export default ProductCarousel;
