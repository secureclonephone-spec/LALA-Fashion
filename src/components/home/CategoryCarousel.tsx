import { FC } from "react";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import { GridTileImage } from "../theme/ui/grid/Tile";
import { NOT_IMAGE } from "@/utils/constants";
import { ArrowRight } from "lucide-react";

interface MobileCategoryItemProps {
  category: any;
  size: "full" | "half";
  priority?: boolean;
}

const MobileCategoryItem: FC<MobileCategoryItemProps> = ({
  category,
  size,
  priority,
}) => {
  return (
    <div
      className={
        size === 'full' ? 'col-span-1 xxs:col-span-2 order-2' : 'col-span-1'
      }
    >
      <Link
        aria-label={`Shop ${category.title} category`}
        className={clsx("relative block w-full")}
        style={{ aspectRatio: size === "half" ? "182/280" : "380/280" }}
        href={category.link_url || "#"}
      >
        <div className="group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-100">
           <Image
            fill
            alt={`${category.title} category image`}
            className="relative h-full w-full object-cover transition duration-500 ease-in-out group-hover:scale-105"
            priority={priority}
            sizes={
              size === "full"
                ? "100vw"
                : "(min-width: 480px) 50vw, 100vw"
            }
            src={category.image_url || NOT_IMAGE}
          />
          {/* Custom Pill - Liquid Glass Style (Inline forced) */}
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 transition-transform group-hover:-translate-y-1"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "2rem",
              padding: "6px 8px 6px 20px",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)"
            }}
          >
            <span 
               className="whitespace-nowrap"
               style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}
            >
              {category.title}
            </span>
            <div 
              className="flex flex-shrink-0 flex-grow-0 items-center justify-center shadow-md"
              style={{
                backgroundColor: "#2563eb",
                borderRadius: "9999px",
                height: "28px",
                width: "28px"
              }}
            >
               <ArrowRight className="w-3.5 h-3.5 text-white stroke-[2.5px]" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

interface CategoryCarouselProps {
  categories: any[];
}

const CategoryCarousel: FC<CategoryCarouselProps> = ({
  categories
}) => {
    if (!categories || categories.length === 0) return null;

    // Based on the mockup, we need exactly 4 categories.
    const topCategories = categories.slice(0, 4);

    if (!topCategories.length) return null;

    return (
      <section className="pt-8 sm:pt-12 lg:pt-20">
        <div className="md:max-w-4.5xl mx-auto mb-10 w-auto text-center md:px-36">
           <h2 className="mb-2 text-2xl md:text-[2rem] font-bold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base font-medium text-gray-500 max-w-2xl mx-auto px-4">
            Discover the latest trends! Fresh products just added—shop new
            styles, tech, and essentials before they're gone.
          </p>
        </div>
        <div className="w-full overflow-x-auto overflow-y-hidden">
          {/* Mobile Layout */}
          <div className="grid gap-4 grid-cols-1 xxs:grid-cols-2 lg:max-h-[calc(100vh-200px)] md:hidden">
            {topCategories.map((category, index) => (
              <MobileCategoryItem
                key={category.id}
                category={category}
                size={index === 0 ? "full" : "half"}
                priority={index < 2}
              />
            ))}
          </div>

          {/* Desktop Layout - 4 Columns */}
          <ul className="m-0 hidden grid-cols-1 gap-6 p-0 md:grid md:grid-cols-4">
            {topCategories.map((category) => (
              <li
                key={category.id}
                className="relative w-full flex-none overflow-hidden rounded-2xl group"
                style={{ aspectRatio: "3/4" }}
              >
                <Link
                  className="relative h-full w-full block"
                  href={category.link_url || "#"}
                  aria-label={`Shop ${category.title} category`}
                >
                   <div className="absolute inset-0 bg-gray-100 mix-blend-multiply opacity-20 z-10 transition-opacity group-hover:opacity-0" />
                   <Image
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    alt={`${category.title} category image`}
                    className="relative object-cover transition duration-700 ease-in-out group-hover:scale-105"
                    src={category.image_url || NOT_IMAGE}
                  />
                  
                  {/* Floating Pill - Liquid Glass Style (Inline forced) */}
                  <div 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 transition-transform duration-300 group-hover:-translate-y-2"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.6)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "2.5rem",
                      padding: "8px 10px 8px 24px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
                    }}
                  >
                     <span 
                       className="whitespace-nowrap"
                       style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}
                     >
                       {category.title}
                     </span>
                     <div 
                       className="flex flex-shrink-0 flex-grow-0 items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                       style={{
                         backgroundColor: "#2563eb",
                         borderRadius: "9999px",
                         height: "36px",
                         width: "36px"
                       }}
                     >
                        <ArrowRight className="w-4 h-4 text-white stroke-[2.5px]" />
                     </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
};

export default CategoryCarousel;
